const Student = require('../models/student');
const CourseRegistration = require('../models/course_registration');
const Course = require('../models/course');
const Batch = require('../models/batch');
const { getNextSequenceValue } = require('./counter');

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

  const isRegistered = await CourseRegistration.findOne({
    studentId,
    courseId: course._id,
    batchId: batch._id
  });

  if (isRegistered) return { success: false, reason: 'Duplicate course registration' };

  const courseSequence = await getNextSequenceValue("course_id_sequence");

  const newCourseReg = new CourseRegistration({
    studentId,
    courseId: course._id,
    batchId: batch._id,
    registration_no: studentRegNo,
    courseReg_no: courseSequence,
  });

  await newCourseReg.save();

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
  });

  const savedStudent = await student.save();

  let courseRegStatus = null;
  if (data.courseCode && data.batchName) {
    courseRegStatus = await registerCourse(savedStudent._id, data.courseCode, data.batchName, studentRegNo);
  }

  return {
    studentId: savedStudent._id,
    registration_no: studentRegNo,
    courseRegStatus
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
