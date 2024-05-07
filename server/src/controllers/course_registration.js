// course_registrationController.js

const CourseRegistration = require("../models/course_registration");

async function getAllCourseRegistrations(req, res) {
  try {
    const registrations = await CourseRegistration.find().populate([
      { path: "studentId" },
      { path: "courseId" },
      { path: "batchId" },
    ]);
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCourseRegistrationById(req, res) {
  const courseRegistrationId = req.params.id;

  try {
    const courseRegistration = await CourseRegistration.findById(
      courseRegistrationId
    ).populate([
      { path: "studentId" },
      { path: "courseId" },
      { path: "batchId" },
    ]);

    if (!courseRegistration) {
      return res.status(404).json({ error: "Course registration not found" });
    }

    res.status(200).json(courseRegistration);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllCourseRegistrationsByStudentId(req, res) {
  const studentId = req.params.id;

  try {
    const registrations = await CourseRegistration.find({ studentId }).populate(
      [{ path: "courseId" }, { path: "batchId" }]
    );
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAllCourseRegistrations, getCourseRegistrationById, getAllCourseRegistrationsByStudentId };
