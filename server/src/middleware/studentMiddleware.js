const CourseRegistration = require("../models/course_registration");

// Middleware to check if any student is assigned to the course
async function checkStudentsAssignedToCourse(req, res, next) {
  try {
    const courseId = req.params.id;

    const registrations = await CourseRegistration.find({ courseId });

    if (registrations.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify course: students are assigned to this course.",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking course assignments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking course assignments.",
    });
  }
}

// Middleware to check if any student is assigned to the batch
async function checkStudentsAssignedToBatch(req, res, next) {
  try {
    const batchId = req.params.id;

    const registrations = await CourseRegistration.find({ batchId });

    if (registrations.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify batch: students are assigned to this batch.",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking batch assignments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking batch assignments.",
    });
  }
}

module.exports = {
  checkStudentsAssignedToCourse,
  checkStudentsAssignedToBatch,
};
