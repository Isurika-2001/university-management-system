const ModuleEntry = require('../models/module_entry');
const Classroom = require('../models/classroom');
const ClassroomStudent = require('../models/classroom_student');
const { STATUSES } = require('../config/statuses');

/**
 * Get the highest completed sequential module number for a student in a course
 * @param {String} enrollmentId - The enrollment ID
 * @param {String} courseId - The course ID
 * @returns {Number} - The highest completed sequential module number (0 if none completed)
 */
async function getHighestCompletedSequentialModule(enrollmentId, courseId) {
  try {
    // Get all sequential modules for this course, ordered by sequence number
    const sequentialModules = await ModuleEntry.find({
      courseId,
      isSequential: true
    })
      .sort({ sequenceNumber: 1 })
      .lean();

    if (sequentialModules.length === 0) {
      return 0; // No sequential modules
    }

    // Get all classrooms for this course
    const classrooms = await Classroom.find({ courseId }).lean();
    const classroomIds = classrooms.map(c => c._id);

    // Get all ClassroomStudent entries for this enrollment where status is PASS
    const completedClassrooms = await ClassroomStudent.find({
      enrollmentId,
      classroomId: { $in: classroomIds },
      status: STATUSES.PASS
    })
      .lean();

    // Create a map of classroomId to moduleId for quick lookup
    const classroomModuleMap = {};
    for (const classroom of classrooms) {
      if (classroom.moduleId) {
        classroomModuleMap[classroom._id.toString()] = classroom.moduleId.toString();
      }
    }

    // Find the highest completed sequential module
    let highestCompleted = 0;
    
    for (const cs of completedClassrooms) {
      const classroomId = cs.classroomId.toString();
      const moduleId = classroomModuleMap[classroomId];
      
      if (!moduleId) continue;

      // Find the module entry for this classroom
      const module = sequentialModules.find(
        m => m._id.toString() === moduleId
      );

      if (module && module.sequenceNumber) {
        if (module.sequenceNumber > highestCompleted) {
          highestCompleted = module.sequenceNumber;
        }
      }
    }

    return highestCompleted;
  } catch (error) {
    console.error('Error in getHighestCompletedSequentialModule:', error);
    return 0;
  }
}

/**
 * Filter modules based on sequential completion status
 * @param {Array} modules - Array of module entries
 * @param {String} enrollmentId - The enrollment ID (optional, for existing students)
 * @param {String} courseId - The course ID
 * @returns {Array} - Filtered array of modules
 */
async function filterModulesBySequentialCompletion(modules, enrollmentId, courseId) {
  if (!modules || modules.length === 0) {
    return [];
  }

  // Check if course has any sequential modules
  const hasSequentialModules = modules.some(m => m.isSequential);
  
  if (!hasSequentialModules) {
    // No sequential modules, return all modules
    return modules;
  }

  // If enrollmentId is not provided (new enrollment), only show module #1
  // Non-sequential modules are only shown after all sequential modules are completed
  if (!enrollmentId) {
    // Return only module #1 (first sequential module)
    return modules.filter(m => 
      m.isSequential && m.sequenceNumber === 1
    );
  }

  // For existing enrollments, check completion status
  const highestCompleted = await getHighestCompletedSequentialModule(enrollmentId, courseId);
  
  // Filter modules:
  // 1. Show all non-sequential modules (if all sequential are completed)
  // 2. Show sequential modules up to the next uncompleted one
  // 3. If all sequential are completed, show all non-sequential modules
  
  const sequentialModules = modules.filter(m => m.isSequential);
  const nonSequentialModules = modules.filter(m => !m.isSequential);
  
  // If all sequential modules are completed, show all modules
  const maxSequentialNumber = sequentialModules.length > 0
    ? Math.max(...sequentialModules.map(m => m.sequenceNumber || 0))
    : 0;
  
  if (highestCompleted >= maxSequentialNumber) {
    // All sequential modules completed, show all modules
    return modules;
  }
  
  // Show the next sequential module (highestCompleted + 1) and all non-sequential modules
  const nextSequentialModule = sequentialModules.find(
    m => m.sequenceNumber === highestCompleted + 1
  );
  
  const filteredModules = [];
  if (nextSequentialModule) {
    filteredModules.push(nextSequentialModule);
  }
  // Note: We don't show non-sequential modules until all sequential are completed
  // filteredModules.push(...nonSequentialModules);
  
  return filteredModules;
}

module.exports = {
  getHighestCompletedSequentialModule,
  filterModulesBySequentialCompletion
};

