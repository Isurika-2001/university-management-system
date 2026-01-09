const Classroom = require('../models/classroom');
const ClassroomStudent = require('../models/classroom_student');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Batch = require('../models/batch');
const Exam = require('../models/exam');
const ExamMark = require('../models/exam_mark');
const ModuleEntry = require('../models/module_entry');
const { STATUSES } = require('../config/statuses');
const { filterModulesBySequentialCompletion } = require('../utils/moduleFilter');
const logger = require('../utils/logger');

// Get all classrooms with student count
async function getAllClassrooms(req, res) {
  try {
    const { batchId, courseId, search = '', enrollmentId } = req.query;
    const filter = {};
    
    if (batchId) {
      filter.batchId = batchId;
    }
    if (courseId) {
      filter.courseId = courseId;
    }

    // Search filter - search in classroom name
    if (search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const classrooms = await Classroom.find(filter)
      .populate('courseId', 'name code')
      .populate('batchId', 'name')
      .populate('moduleId')
      .lean();

    // If search is provided, also filter by course name or batch name
    let filteredClassrooms = classrooms;
    if (search.trim() !== '') {
      const searchLower = search.trim().toLowerCase();
      filteredClassrooms = classrooms.filter((classroom) => {
        const courseName = (classroom.courseId?.name || '').toLowerCase();
        const batchName = (classroom.batchId?.name || '').toLowerCase();
        const classroomName = (classroom.name || '').toLowerCase();
        return (
          classroomName.includes(searchLower) ||
          courseName.includes(searchLower) ||
          batchName.includes(searchLower)
        );
      });
    }

    // Filter based on sequential modules if courseId and enrollmentId are provided
    // Skip this filtering if no enrollmentId (e.g., when admin is creating classrooms)
    if (courseId && enrollmentId && filteredClassrooms.length > 0) {
      const allModules = await ModuleEntry.find({ courseId }).lean();
      const hasSequentialModules = allModules.some(m => m.isSequential);
      
      if (hasSequentialModules) {
        // Filter modules based on enrollment status
        const filteredModules = await filterModulesBySequentialCompletion(
          allModules,
          enrollmentId,
          courseId
        );
        
        const allowedModuleIds = new Set(filteredModules.map(m => m._id.toString()));
        
        // Filter classrooms to only include those with allowed modules
        filteredClassrooms = filteredClassrooms.filter(c => {
          if (!c.moduleId || !c.moduleId._id) return false;
          return allowedModuleIds.has(c.moduleId._id.toString());
        });
      }
    }

    // Get student count for each classroom
    const result = await Promise.all(
      filteredClassrooms.map(async (classroom) => {
        const studentCount = await ClassroomStudent.countDocuments({ classroomId: classroom._id });
        return {
          ...classroom,
          studentCount
        };
      })
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error('Error in getAllClassrooms:', error);
    res.status(500).json({ success: false, message: 'Error fetching classrooms', error: error.message });
  }
}

// Create new classroom
async function createClassroom(req, res) {
  try {
    const { courseId, batchId, moduleId, month, capacity, description } = req.body;

    if (!courseId || !batchId || !moduleId || !month) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Load course and batch to build canonical classroom name
    const course = await Course.findById(courseId).lean();
    const batch = await Batch.findById(batchId).lean();

    if (!course || !batch) {
      return res.status(404).json({ success: false, message: 'Course or Batch not found' });
    }

    // Validate module entry
    const moduleEntry = await ModuleEntry.findById(moduleId).lean();
    if (!moduleEntry) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Check if a classroom already exists for this course, batch, and module combination
    // (regardless of month - one module can only have one classroom per course/intake)
    const existingClassroom = await Classroom.findOne({
      courseId,
      batchId,
      moduleId: moduleEntry._id
    });
    
    if (existingClassroom) {
      return res.status(403).json({ 
        success: false, 
        message: `A classroom for module "${moduleEntry.name}" already exists for this course and intake. Each module can only have one classroom per intake.` 
      });
    }

    // Generate name: COURSECODE-INTAKENAME-MONTH (replace spaces with hyphens)
    const code = (course.code || '').toString().trim();
    const intakeLabel = (batch.name || '').toString().trim().replace(/\s+/g, '-');
    const monthLabel = month.toString().trim();
    const name = `${code}-${intakeLabel}-${monthLabel}`;

    // Also check if classroom name already exists (for backward compatibility)
    const existingByName = await Classroom.findOne({ name });
    if (existingByName) {
      return res.status(403).json({ success: false, message: 'Classroom with same course/intake/month already exists' });
    }

    const classroom = new Classroom({
      name,
      courseId,
      batchId,
      moduleId: moduleEntry._id,
      moduleName: moduleEntry.name,
      month: monthLabel,
      capacity: capacity || 50,
      description: description || ''
    });

    const savedClassroom = await classroom.save();
    await savedClassroom.populate('courseId batchId moduleId');

    // Auto-create exam for this classroom
    try {
      const exam = await Exam.create({
        classroomId: savedClassroom._id,
        name: `${savedClassroom.name} - Exam`,
        date: null,
        description: `Exam for classroom ${savedClassroom.name}`
      });
      logger.info('Auto-created exam:', exam._id);
    } catch (examErr) {
      logger.error('Error auto-creating exam:', examErr);
      // Don't fail the classroom creation if exam creation fails
    }

    res.status(201).json({ success: true, message: 'Classroom created successfully', data: savedClassroom });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error creating classroom', error: error.message });
  }
}

// Get classroom by ID with students
async function getClassroomById(req, res) {
  try {
    const { id } = req.params;
    const { fresh } = req.query; // 'fresh' parameter from frontend (currently not used for explicit cache busting as Mongoose.findById typically gets fresh data)

    const classroom = await Classroom.findById(id)
      .populate('courseId', 'name code')
      .populate('batchId', 'name')
      .populate('moduleId', 'name')
      .lean();

    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    // Get students in this classroom
    const classroomStudents = await ClassroomStudent.find({ classroomId: id })
      .populate({
        path: 'enrollmentId',
        select: 'enrollment_no'
      })
      .populate({
        path: 'studentId',
        select: 'firstName lastName'
      })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...classroom,
        students: classroomStudents
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error fetching classroom' });
  }
}

// Get eligible classrooms for a student (same course, different modules)
async function getEligibleClassrooms(req, res) {
  try {
    const { enrollmentId } = req.params;

    // Get enrollment with course info
    const enrollment = await Enrollment.findById(enrollmentId).populate('courseId').populate('batchId').lean();
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Find all classrooms for the same course and batch
    const allClasses = await Classroom.find({
      courseId: enrollment.courseId._id,
      batchId: enrollment.batchId._id
    })
      .populate('batchId', 'name')
      .populate('moduleId')
      .lean();

    // Find all classrooms the student is already in for this enrollment
    const studentClassrooms = await ClassroomStudent.find({ enrollmentId }).lean();
    const studentClassroomIds = studentClassrooms.map((c) => c.classroomId.toString());

    // Filter out the classrooms the student is already in
    let eligibleClassrooms = allClasses.filter((c) => !studentClassroomIds.includes(c._id.toString()));

    // Filter based on sequential module completion
    // Get all modules for this course
    const allModules = await ModuleEntry.find({ courseId: enrollment.courseId._id }).lean();
    
    // Filter modules based on sequential completion
    const filteredModules = await filterModulesBySequentialCompletion(
      allModules,
      enrollmentId,
      enrollment.courseId._id.toString()
    );
    
    const allowedModuleIds = new Set(filteredModules.map(m => m._id.toString()));
    
    // Filter classrooms to only include those with allowed modules
    eligibleClassrooms = eligibleClassrooms.filter(c => {
      if (!c.moduleId) return false;
      return allowedModuleIds.has(c.moduleId._id.toString());
    });

    res.status(200).json({ success: true, data: eligibleClassrooms });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error fetching eligible classrooms' });
  }
}

// Add student to classroom
async function addStudentToClassroom(req, res) {
  try {
    const { classroomId, enrollmentId, studentId, status } = req.body;

    if (!classroomId || !enrollmentId || !studentId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if already exists
    const existing = await ClassroomStudent.findOne({ classroomId, enrollmentId });
    if (existing) {
      return res.status(403).json({ success: false, message: 'Student already in this classroom' });
    }

    const classroomStudent = new ClassroomStudent({
      classroomId,
      enrollmentId,
      studentId,
      status: status || 'active'
    });

    const saved = await classroomStudent.save();
    await saved.populate('enrollmentId studentId');

    res.status(201).json({ success: true, message: 'Student added to classroom', data: saved });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error adding student to classroom' });
  }
}

// Remove student from classroom
async function removeStudentFromClassroom(req, res) {
  try {
    const { id } = req.params;

    await ClassroomStudent.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Student removed from classroom' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error removing student' });
  }
}

// Update student status in classroom
async function updateStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(STATUSES).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await ClassroomStudent.findByIdAndUpdate(id, { status }, { new: true })
      .populate('enrollmentId studentId');

    res.status(200).json({ success: true, message: 'Status updated', data: updated });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
}

// Delete classroom
async function deleteClassroom(req, res) {
  try {
    const { id } = req.params;

    // Check if there are any students in the classroom
    const studentCount = await ClassroomStudent.countDocuments({ classroomId: id });
    if (studentCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete classroom with students. Please remove all students from the classroom before deleting.' 
      });
    }

    // Delete associated exam marks
    const exams = await Exam.find({ classroomId: id });
    for (const exam of exams) {
      await ExamMark.deleteMany({ examId: exam._id });
    }

    // Delete associated exams
    await Exam.deleteMany({ classroomId: id });

    // Delete classroom students
    await ClassroomStudent.deleteMany({ classroomId: id });

    // Delete classroom
    await Classroom.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error deleting classroom' });
  }
}

async function getClassroomsByCourseAndBatch(req, res) {
  try {
    const { courseId, batchId } = req.params;
    const classrooms = await Classroom.find({ courseId, batchId })
      .populate('courseId', 'name code')
      .populate('batchId', 'name')
      .populate('moduleId', 'name')
      .lean();
    res.status(200).json(classrooms);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Error fetching classrooms' });
  }
}

module.exports = {
  getAllClassrooms,
  createClassroom,
  getClassroomById,
  getEligibleClassrooms,
  addStudentToClassroom,
  removeStudentFromClassroom,
  updateStudentStatus,
  deleteClassroom,
  getClassroomsByCourseAndBatch
};
