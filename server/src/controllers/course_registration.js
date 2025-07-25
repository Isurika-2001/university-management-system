// course_registrationController.js

const CourseRegistration = require("../models/course_registration");

async function getAllCourseRegistrations(req, res) {
  try {
    const { search = '', courseId, batchId, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const matchStage = {};

    if (courseId) {
      matchStage.courseId = new mongoose.Types.ObjectId(courseId);
    }

    if (batchId) {
      matchStage.batchId = new mongoose.Types.ObjectId(batchId);
    }

    const searchRegex = search.trim() !== '' ? new RegExp(search, 'i') : null;

    const aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'batches',
          localField: 'batchId',
          foreignField: '_id',
          as: 'batch'
        }
      },
      { $unwind: '$batch' }
    ];

    if (searchRegex) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { registration_no: searchRegex },
            { courseReg_no: searchRegex },
            { 'student.firstName': searchRegex },
            { 'student.lastName': searchRegex },
            { 'student.nic': searchRegex },
            { 'student.mobile': searchRegex },
            { 'student.homeContact': searchRegex },
            { 'student.address': searchRegex }
          ]
        }
      });
    }

    const totalCountPipeline = [...aggregationPipeline, { $count: 'total' }];

    const resultsPipeline = [
      ...aggregationPipeline,
      { $skip: skip },
      { $limit: limitNum }
    ];

    const [totalCountResult, paginatedResults] = await Promise.all([
      CourseRegistration.aggregate(totalCountPipeline),
      CourseRegistration.aggregate(resultsPipeline)
    ]);

    const total = totalCountResult[0]?.total || 0;

    res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: paginatedResults
    });
  } catch (error) {
    console.error(error);
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
