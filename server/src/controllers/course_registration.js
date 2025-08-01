// course_registrationController.js

const CourseRegistration = require("../models/course_registration");
const mongoose = require('mongoose');
const ActivityLogger = require("../utils/activityLogger");
const { getRequestInfo } = require("../middleware/requestInfo");

async function getAllCourseRegistrations(req, res) {
  try {
    const { search = '', courseId, batchId, page = 1, limit = 10, sortBy = 'courseReg_no', sortOrder = 'asc' } = req.query;

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
            { 'student.address': searchRegex },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
                  regex: searchRegex
                }
              }
            }
          ]
        }
      });
    }

    // Add sorting stage
    const sortStage = {};
    const sortOrderNum = sortOrder === 'desc' ? -1 : 1;
    
    // Map frontend sort fields to database fields
    const sortFieldMap = {
      'courseReg_no': 'courseReg_no',
      'studentId': 'student.registration_no',
      'name': { $concat: ['$student.firstName', ' ', '$student.lastName'] },
      'nic': 'student.nic',
      'course': 'course.name',
      'batch': 'batch.name',
      'contact': 'student.mobile',
      'address': 'student.address'
    };

    const sortField = sortFieldMap[sortBy] || 'courseReg_no';
    sortStage[sortField] = sortOrderNum;

    const totalCountPipeline = [...aggregationPipeline, { $count: 'total' }];

    const resultsPipeline = [
      ...aggregationPipeline,
      { $sort: sortStage },
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

async function exportCourseRegistrations(req, res) {
  try {
    const { search = '', courseId, batchId } = req.query;
    const requestInfo = getRequestInfo(req);

    console.log('--- Export Course Registrations Request ---');
    console.log('Received Query Params:', { search, courseId, batchId });

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (batchId) filter.batchId = batchId;

    console.log('MongoDB Filter:', filter);

    let registrations = await CourseRegistration.find(filter)
      .populate([
        { path: 'studentId' },
        { path: 'courseId' },
        { path: 'batchId' }
      ]);

    console.log('Registrations fetched from DB:', registrations.length);

    // If search term is provided, further filter results
    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      const searchRegex = new RegExp(search, 'i');

      registrations = registrations.filter((reg) => {
        const student = reg.studentId;
        if (!student) return false;

        const nameMatch =
          student.firstName?.toLowerCase().includes(lowerSearch) ||
          student.lastName?.toLowerCase().includes(lowerSearch);
        const nicMatch = student.nic?.toLowerCase().includes(lowerSearch);
        const contactMatch =
          student.mobile?.toLowerCase().includes(lowerSearch) ||
          student.homeContact?.toLowerCase().includes(lowerSearch);
        const addressMatch = student.address?.toLowerCase().includes(lowerSearch);

        const regNoMatch = reg.registration_no?.toLowerCase().includes(lowerSearch);
        const courseRegNoMatch = reg.courseReg_no?.toLowerCase().includes(lowerSearch);

        return nameMatch || nicMatch || contactMatch || addressMatch || regNoMatch || courseRegNoMatch;
      });

      console.log('Registrations after search filter:', registrations.length);
    }

    // Map data to your export structure if needed
    const exportData = registrations.map((reg) => ({
      registrationNo: reg.registration_no,
      courseRegNo: reg.courseReg_no,
      studentId: reg.studentId?.registration_no,
      studentName: `${reg.studentId?.firstName || ''} ${reg.studentId?.lastName || ''}`,
      nic: reg.studentId?.nic,
      course: reg.courseId?.name,
      batch: reg.batchId?.name,
      contact: reg.studentId?.mobile,
      address: reg.studentId?.address
    }));

    console.log('Final export data count:', exportData.length);

    // Log the export activity
    await ActivityLogger.logCourseRegistrationExport(req.user, exportData.length, requestInfo.ipAddress, requestInfo.userAgent);

    res.status(200).json({
      total: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Error in exportCourseRegistrations:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAllCourseRegistrations, getCourseRegistrationById, getAllCourseRegistrationsByStudentId, exportCourseRegistrations };
