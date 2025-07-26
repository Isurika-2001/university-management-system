// utilities/bulkUploadHelper.js

const Student = require('../models/student');
const CourseRegistration = require('../models/course_registration');
const { getNextSequenceValue } = require('./counter');

// Check if student exists by NIC
async function findStudentByNIC(nic) {
  return await Student.findOne({ nic });
}

// Register student for a course
async function registerCourse(studentId, courseId, batchId, studentRegNo) {
  const isRegistered = await CourseRegistration.findOne({
    studentId,
    courseId,
    batchId
  });

  if (isRegistered) return { success: false, reason: 'Duplicate course registration' };

  const courseSequence = await getNextSequenceValue("course_id_sequence");

  const newCourseReg = new CourseRegistration({
    studentId,
    courseId,
    batchId,
    registration_no: studentRegNo,
    courseReg_no: courseSequence,
  });

  await newCourseReg.save();

  return { success: true };
}

// Create new student
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

  if (data.courseId && data.batchId) {
    const courseRegResult = await registerCourse(savedStudent._id, data.courseId, data.batchId, studentRegNo);
    return {
      studentId: savedStudent._id,
      registration_no: studentRegNo,
      courseRegStatus: courseRegResult
    };
  }

  return {
    studentId: savedStudent._id,
    registration_no: studentRegNo,
    courseRegStatus: null
  };
}

module.exports = {
  findStudentByNIC,
  createStudentAndRegister,
  registerCourse
};
