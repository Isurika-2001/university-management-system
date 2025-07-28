const Student = require("../models/student");
const CourseRegistration = require("../models/course_registration");
const Batch = require("../models/batch");
const Course = require("../models/course");
const User = require("../models/user");

// get no of courseRegistrations, courses, batches, today's courseRegistrations
async function getEnrollmentSummaryStats(req, res) {
  try {
    const totalRegistrations = await Student.countDocuments();

    const distinctCourses = await CourseRegistration.distinct("courseId");
    const totalRunningCourses = distinctCourses.length;

    const distinctBatches = await CourseRegistration.distinct("batchId");
    const totalRunningBatches = distinctBatches.length;

    // get total courses
    const totalCourses = await Course.countDocuments();

    // get total batches
    const totalBatches = await Batch.countDocuments();

    // Today's course registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysRegistrations = await CourseRegistration.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        totalRunningCourses,
        totalRunningBatches,
        totalCourses,
        totalBatches,
        todaysRegistrations
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollment summary stats",
      error: error.message
    });
  }
}


module.exports = {
  getEnrollmentSummaryStats
};
