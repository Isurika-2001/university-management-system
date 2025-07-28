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
        { orientationDate: { $gte: new Date() } }
      ]
    }).sort({ startDate: 1, orientationDate: 1 });

    const upcomingBatches = batches.map(batch => ({
      name: batch.name,
      startDate: batch.startDate,
      orientationDate: batch.orientationDate
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

// create a api to get totalRunningCourses, no of registrations over each running course
// response be like 

// {
//     "success": true,
//     "data": {
//         "totalRunningCourses": 3,
//         "registrations": [
//             { 
//                 "courseId": "course1",
//                 "courseName": "MERN",  
//                 "registrations": 80
//             },
//             {
//                 "courseId": "course2",
//                 "courseName": "DPE",
//                 "registrations": 95
//             },
//             {
//                 "courseId": "course3",
//                 "courseName": "English",
//                 "registrations": 70
//             }
//         ]
//     }
// }

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

module.exports = {
  getEnrollmentSummaryStats,
  getUpcomingBatchDates,
  getCourseRegistrations
};
