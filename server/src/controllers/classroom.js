const Classroom = require('../models/classroom');
const ClassroomStudent = require('../models/classroom_student');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Batch = require('../models/batch');
const Exam = require('../models/exam');
const ExamMark = require('../models/exam_mark');
const ModuleEntry = require('../models/module_entry');
const { STATUSES } = require('../config/statuses');

// Get all classrooms with student count
async function getAllClassrooms(req, res) {
  try {
    // Support filtering by batchId query parameter
    const { batchId, courseId } = req.query;
    const filter = {};
    
    if (batchId) {
      filter.batchId = batchId;
    }
    if (courseId) {
      filter.courseId = courseId;
    }

    const classrooms = await Classroom.find(filter)
      .populate('courseId', 'name code')
      .populate('batchId', 'name')
      .populate('moduleId', 'name')
      .lean();

    // Get student count for each classroom
    const result = await Promise.all(
      classrooms.map(async (classroom) => {
        const studentCount = await ClassroomStudent.countDocuments({ classroomId: classroom._id });
        return {
          ...classroom,
          studentCount
        };
      })
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in getAllClassrooms:', error);
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

    // Generate name: COURSECODE-INTAKENAME-MONTH (replace spaces with hyphens)
    const code = (course.code || '').toString().trim();
    const intakeLabel = (batch.name || '').toString().trim().replace(/\s+/g, '-');
    const monthLabel = month.toString().trim();
    const name = `${code}-${intakeLabel}-${monthLabel}`;

    // Check if classroom name already exists
    const existing = await Classroom.findOne({ name });
    if (existing) {
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
      console.log('Auto-created exam:', exam._id);
    } catch (examErr) {
      console.error('Error auto-creating exam:', examErr);
      // Don't fail the classroom creation if exam creation fails
    }

    res.status(201).json({ success: true, message: 'Classroom created successfully', data: savedClassroom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error creating classroom', error: error.message });
  }
}

// Get classroom by ID with students
async function getClassroomById(req, res) {
  try {
    const { id } = req.params;

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
    console.error(error);
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
    }).lean();

    // Find all classrooms the student is already in for this enrollment
    const studentClassrooms = await ClassroomStudent.find({ enrollmentId }).lean();
    const studentClassroomIds = studentClassrooms.map((c) => c.classroomId.toString());

    // Filter out the classrooms the student is already in
    const eligibleClassrooms = allClasses.filter((c) => !studentClassroomIds.includes(c._id.toString()));

    res.status(200).json({ success: true, data: eligibleClassrooms });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
}

// Delete classroom
async function deleteClassroom(req, res) {
  try {
    const { id } = req.params;

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
    console.error(error);
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
    console.error(error);
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
