const Student = require('../models/student');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const Batch = require('../models/batch');
const { getNextSequenceValue, getAndFormatCourseEnrollmentNumber } = require('./counter');

// Find existing student by NIC
async function findStudentByNIC(nic) {
  return await Student.findOne({ nic });
}

// Find course by course code
async function findCourseByCode(code) {
  return await Course.findOne({ code });
}

// Find batch by batch name and courseId
async function findBatchByNameAndCourse(batchName, courseId) {
  return await Batch.findOne({ name: batchName, courseId });
}

// Register student for a course
async function registerCourse(studentId, courseCode, batchName, studentRegNo) {
  const course = await findCourseByCode(courseCode);
  if (!course) return { success: false, reason: `Invalid course code: ${courseCode}` };

  const batch = await findBatchByNameAndCourse(batchName, course._id);
  if (!batch) return { success: false, reason: `Batch '${batchName}' does not exist for course '${courseCode}'` };

  const isRegistered = await Enrollment.findOne({
    studentId,
    courseId: course._id,
    batchId: batch._id
  });

  if (isRegistered) return { success: false, reason: 'Duplicate enrollment' };

  const courseSequence = await getAndFormatCourseEnrollmentNumber(course.code, batch.name);

  const newEnrollment = new Enrollment({
    studentId,
    courseId: course._id,
    batchId: batch._id,
    registration_no: studentRegNo,
    enrollment_no: courseSequence,
    enrollmentDate: new Date(),
  });

  await newEnrollment.save();

  // Check completion status after adding the new enrollment
  const student = await Student.findById(studentId);
  if (student) {
    const { getStudentCompletionStatus } = require('../controllers/student');
    const completionStatus = await getStudentCompletionStatus(student);
    
    // Update student status if it has changed
    if (student.status !== completionStatus.overall) {
      student.status = completionStatus.overall;
      await student.save();
    }
  }

  return { success: true };
}

// Create student and register for course
async function createStudentAndRegister(data) {
  const studentRegNo = await getNextSequenceValue("unique_id_sequence");

  const student = new Student({
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    nic: data.nic,
    address: data.address,
    mobile: data.mobile,
    homeContact: data.homeContact,
    email: data.email,
    registration_no: studentRegNo,
    // New fields with defaults
    registrationDate: new Date(),
    highestAcademicQualification: data.highestAcademicQualification || 'O-Level',
    qualificationDescription: data.qualificationDescription || 'Not specified',
    requiredDocuments: data.requiredDocuments || [],
    emergencyContact: data.emergencyContact || {
      name: 'Not specified',
      relationship: 'Not specified',
      phone: 'Not specified'
    },
  });

  const savedStudent = await student.save();

  let courseRegStatus = null;
  if (data.courseCode && data.batchName) {
    courseRegStatus = await registerCourse(savedStudent._id, data.courseCode, data.batchName, studentRegNo);
  }

  // Check completion status after student creation and course registration
  const { getStudentCompletionStatus } = require('../controllers/student');
  const completionStatus = await getStudentCompletionStatus(savedStudent);
  
  // Update student status
  savedStudent.status = completionStatus.overall;
  await savedStudent.save();

  return {
    studentId: savedStudent._id,
    registration_no: studentRegNo,
    courseRegStatus,
    completionStatus
  };
}

// Register existing student for a course
async function registerExistingStudent(student, courseCode, batchName) {
  return await registerCourse(student._id, courseCode, batchName, student.registration_no);
}

module.exports = {
  findStudentByNIC,
  createStudentAndRegister,
  registerExistingStudent
};
