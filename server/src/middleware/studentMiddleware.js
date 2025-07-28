const CourseRegistration = require("../models/course_registration");
const Batch = require("../models/batch");

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
    const { courseId, year, number } = req.body;

    const existingBatch = await Batch.findById(batchId);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Save the original batch to use later
    req.existingBatch = existingBatch;

    const studentsExist = await CourseRegistration.exists({ batchId });

    // Check if restricted fields are changed
    const isRestrictedFieldChanged =
      courseId !== String(existingBatch.courseId) ||
      year !== existingBatch.name.split('.')[0] ||
      number !== existingBatch.name.split('.')[1];

    if (studentsExist && isRestrictedFieldChanged) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify batch details (course/year/number) while students are assigned. You may still update the date fields.",
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
