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

// get Upcoming Batch Dates (check only upcoming start dates or orientation dates, if both/one of them is available return batch name, start date, orientation date)
async function getUpcomingBatchDates(req, res) {
  try {
    const batches = await Batch.find({
      $or: [
        { startDate: { $gte: new Date() } },
        { orientationDate: { $gte: new Date() } },
        { registrationDeadline: { $gte: new Date() } }
      ]
    })
    .populate('courseId', 'name') // populate courseId field but only get 'name' field of course
    .sort({ startDate: 1, orientationDate: 1 });

    const upcomingBatches = batches.map(batch => ({
      name: batch.name,
      startDate: batch.startDate,
      orientationDate: batch.orientationDate,
      registrationDeadline: batch.registrationDeadline,
      courseName: batch.courseId ? batch.courseId.name : null
    }));

    res.status(200).json({
      success: true,
      data: upcomingBatches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming batch dates",
      error: error.message
    });
  }
}

async function getCourseRegistrations(req, res) {
  try {
    const registrations = await CourseRegistration.aggregate([
      {
        $group: {
          _id: "$courseId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails"
        }
      },
      {
        $unwind: "$courseDetails"
      },
      {
        $project: {
          courseId: "$_id",
          courseName: "$courseDetails.name",
          registrations: "$count"
        }
      }
    ]);

    // Calculate total number of registrations
    const totalRegistrations = registrations.reduce((sum, item) => sum + item.registrations, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRunningCourses: registrations.length,
        totalRegistrations,
        registrations
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching course registrations",
      error: error.message
    });
  }
}

// Get annual, monthly, and trend-wise enrollment summary
async function getEnrollmentNumbers(req, res) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    // Get annual enrollment numbers
    const annualEnrollment = await CourseRegistration.countDocuments({
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    });

    // Get this month's enrollment numbers
    const startOfMonth = new Date(currentYear, now.getMonth(), 1);
    const endOfMonth = new Date(currentYear, now.getMonth() + 1, 1);

    const monthlyEnrollment = await CourseRegistration.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const percentageOverAnnual =
      annualEnrollment > 0
        ? ((monthlyEnrollment / annualEnrollment) * 100).toFixed(2)
        : "0.00";

    // Monthly enrollment trend from Jan to current month
    const enrollmentTrend = await CourseRegistration.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lt: endOfYear }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    // Format trend with 0s for missing months
    const trendData = Array.from({ length: now.getMonth() + 1 }, (_, i) => {
      const month = i + 1;
      const found = enrollmentTrend.find((m) => m._id.month === month);
      return {
        month,
        count: found ? found.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        annualEnrollment,
        monthlyEnrollment,
        percentageOverAnnual,
        monthlyTrend: trendData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrollment numbers",
      error: error.message
    });
  }
}

// Get recent students for dashboard
async function getRecentStudents(req, res) {
  try {
    const { limit = 3 } = req.query;
    
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName email registration_no createdAt updatedAt');

    res.status(200).json({
      success: true,
      data: recentStudents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent students",
      error: error.message
    });
  }
}

module.exports = {
  getEnrollmentSummaryStats,
  getUpcomingBatchDates,
  getCourseRegistrations,
  getEnrollmentNumbers,
  getRecentStudents
};
