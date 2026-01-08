// enrollmentController.js

const Enrollment = require('../models/enrollment');
const Student = require('../models/student');
const mongoose = require('mongoose');
const ActivityLogger = require('../utils/activityLogger');
const { getRequestInfo } = require('../middleware/requestInfo');
const { getAndFormatCourseEnrollmentNumber } = require('../utilities/counter');
const { generateCSV, generateExcel, enrollmentExportHeaders } = require('../utils/exportUtils');
const logger = require('../utils/logger');
const ClassroomStudent = require('../models/classroom_student'); // Import ClassroomStudent model
const { STATUSES } = require('../config/statuses'); // Import STATUSES

// Import getStudentCompletionStatus from student controller
const { getStudentCompletionStatus } = require('./student');

async function getAllEnrollments(req, res) {
  try {
    const { search = '', courseId, batchId, page = 1, limit = 10, sortBy = 'enrollment_no', sortOrder = 'asc' } = req.query;

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

    // Use safe regex creation to prevent RegExp injection
    const { createSafeRegex } = require('../utils/regexUtils');
    const searchRegex = search.trim() !== '' ? createSafeRegex(search) : null;
    
    if (search.trim() !== '' && !searchRegex) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search term'
      });
    }

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
            { enrollment_no: searchRegex },
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
      'enrollment_no': 'enrollment_no',
      'student.registration_no': 'student.registration_no',
      'studentName': { $concat: ['$student.firstName', ' ', '$student.lastName'] },
      'student.nic': 'student.nic',
      'course.name': { $toLower: '$course.name' }, // Case-insensitive sorting
      'batch.name': { $toLower: '$batch.name' }, // Case-insensitive sorting
      'student.mobile': 'student.mobile',
      'student.address': 'student.address',
      'enrollmentDate': 'enrollmentDate'
    };

    if (sortFieldMap[sortBy]) {
      sortStage[sortFieldMap[sortBy]] = sortOrderNum;
    } else {
      sortStage.enrollment_no = sortOrderNum;
    }

    aggregationPipeline.push({ $sort: sortStage });

    // Add pagination
    aggregationPipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    // Get total count for pagination
    // Fix: Use $count after all filters, including search, to ensure correct count
    const countPipeline = [
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
      countPipeline.push({
        $match: {
          $or: [
            { registration_no: searchRegex },
            { enrollment_no: searchRegex },
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

    countPipeline.push({ $count: 'total' });

    const [enrollments, countResult] = await Promise.all([
      Enrollment.aggregate(aggregationPipeline),
      Enrollment.aggregate(countPipeline)
    ]);

    // Fix: If countResult is empty, set total to 0 (not null or undefined)
    let total = 0;
    if (Array.isArray(countResult) && countResult.length > 0 && typeof countResult[0].total === 'number') {
      total = countResult[0].total;
    }

    const totalPages = Math.ceil(total / limitNum);

    const requestInfo = getRequestInfo(req);
    await ActivityLogger.logActivity(req.user, 'READ', 'Enrollment', 'Retrieved all enrollments', requestInfo);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    logger.error('Error in getAllEnrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getEnrollmentById(req, res) {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
    ]);

    if (!enrollment || enrollment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const requestInfo = getRequestInfo(req);
    await ActivityLogger.logActivity(req.user, 'READ', 'Enrollment', `Retrieved enrollment ${id}`, requestInfo);

    res.json({
      success: true,
      data: enrollment[0]
    });
  } catch (error) {
    logger.error('Error in getEnrollmentById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getAllEnrollmentsByStudentId(req, res) {
  try {
    const { id } = req.params;

    const enrollments = await Enrollment.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(id) } },
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
      { $unwind: '$batch' },
      { $sort: { enrollmentDate: -1 } }
    ]);

    const requestInfo = getRequestInfo(req);
    await ActivityLogger.logActivity(req.user, 'READ', 'Enrollment', `Retrieved enrollments for student ${id}`, requestInfo);

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    logger.error('Error in getAllEnrollmentsByStudentId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function createEnrollment(req, res) {
  try {
    const enrollmentData = req.body;
    const requestInfo = getRequestInfo(req);

    // Check if student is already enrolled in this course and batch
    const existingEnrollment = await Enrollment.findOne({
      studentId: enrollmentData.studentId,
      courseId: enrollmentData.courseId,
      batchId: enrollmentData.batchId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course and batch'
      });
    }

    // Get student to get registration_no
    const student = await Student.findById(enrollmentData.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Generate enrollment number: batch.name + course.code + 3-digit per-course sequence
    const course = await require('../models/course').findById(enrollmentData.courseId);
    const batch = await require('../models/batch').findById(enrollmentData.batchId);
    if (!course || !batch) {
      return res.status(400).json({ success: false, message: 'Invalid course or batch' });
    }
    const formattedEnrollmentNo = await getAndFormatCourseEnrollmentNumber(course.code, batch.name);

    const enrollment = new Enrollment({
      ...enrollmentData,
      registration_no: student.registration_no,
      enrollment_no: formattedEnrollmentNo,
      enrollmentDate: new Date(),
    });
    await enrollment.save();

    // Check completion status after adding the new enrollment
    const completionStatus = await getStudentCompletionStatus(student);
    const previousStatus = student.status;
    
    // Update student status if it has changed
    if (student.status !== completionStatus.overall) {
      student.status = completionStatus.overall;
      await student.save();
    }

    await ActivityLogger.logActivity(req.user, 'CREATE', 'Enrollment', `Created enrollment ${enrollment.enrollment_no}`, requestInfo);

    // Prepare response message based on completion status
    let message = 'Enrollment created successfully';
    if (completionStatus.overall === 'completed' && previousStatus !== 'completed') {
      message = 'Enrollment created successfully. Student registration is now complete!';
    } else if (completionStatus.overall === 'incomplete') {
      const missingSteps = [];
      if (!completionStatus.step1) missingSteps.push('Personal Details');
      if (!completionStatus.step2) missingSteps.push('Course Enrollment');
      if (!completionStatus.step3) missingSteps.push('Academic Details');
      if (!completionStatus.step4) missingSteps.push('Required Documents');
      if (!completionStatus.step5) missingSteps.push('Emergency Contact');
      
      if (missingSteps.length > 0) {
        message = `Enrollment created successfully. Student registration is incomplete. Missing: ${missingSteps.join(', ')}`;
      }
    }

    res.status(201).json({
      success: true,
      message,
      data: {
        ...enrollment.toObject(),
        completionStatus
      }
    });
  } catch (error) {
    logger.error('Error in createEnrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function updateEnrollment(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const requestInfo = getRequestInfo(req);

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await ActivityLogger.logActivity(req.user, 'UPDATE', 'Enrollment', `Updated enrollment ${enrollment.enrollment_no}`, requestInfo);

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: enrollment
    });
  } catch (error) {
    logger.error('Error in updateEnrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;
    const requestInfo = getRequestInfo(req);

    const enrollment = await Enrollment.findByIdAndDelete(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Also delete associated ClassroomStudent records (if the status of the classroom student is Pass or Fail, change to Dropped, if the current status is dropped leave it as is, otherwise delete the record)
    const classroomStudents = await ClassroomStudent.find({ enrollmentId: enrollment._id });

    for (const cs of classroomStudents) {
      if (cs.status === STATUSES.PASS || cs.status === STATUSES.FAIL) {
        cs.status = STATUSES.DROPPED;
        await cs.save();
      } else if (cs.status !== STATUSES.DROPPED) {
        await ClassroomStudent.findByIdAndDelete(cs._id);
      }
    }

    await ActivityLogger.logActivity(req.user, 'DELETE', 'Enrollment', `Deleted enrollment ${enrollment.enrollment_no}`, requestInfo);

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteEnrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function addBatchTransfer(req, res) {
  try {
    const { id } = req.params; // Enrollment ID
    const { batchId, reason, classroomId: newClassroomId } = req.body; // newClassroomId from frontend
    const requestInfo = getRequestInfo(req);

    logger.info('addBatchTransfer called with:', { id, batchId, reason, newClassroomId });

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Validate required fields
    if (!batchId || !reason || !newClassroomId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID, Classroom ID, and reason are required'
      });
    }

    // --- Update previous ClassroomStudent records to 'dropped' ---
    // Find all ClassroomStudent records for this enrollment that are active or on hold in the old batch/classroom
    await ClassroomStudent.updateMany(
      {
        enrollmentId: enrollment._id,
        status: { $in: [STATUSES.ACTIVE, STATUSES.HOLD] } // Only update active or held records
      },
      { $set: { status: STATUSES.DROPPED } }
    );
    logger.info(`ClassroomStudent records for enrollment ${enrollment._id} set to 'dropped'.`);


    // --- Create a new ClassroomStudent record for the dropped enrollment in the new classroom ---
    const newClassroomStudent = new ClassroomStudent({
      classroomId: newClassroomId,
      enrollmentId: enrollment._id,
      studentId: enrollment.studentId, // Use the studentId from the original enrollment
      status: STATUSES.ACTIVE // New enrollment starts as active
    });
    await newClassroomStudent.save();
    logger.info(`New ClassroomStudent record created for enrollment ${enrollment._id} in classroom ${newClassroomId}.`);


    // --- Update the enrollment itself with the new batch ---
    const updateData = {
      batchId,
      $push: {
        batchTransfers: {
          batch: batchId,
          date: new Date(),
          reason,
          classroomId: newClassroomId // Also store the classroom to which it was dropped
        }
      }
    };

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    await ActivityLogger.logActivity(req.user, 'UPDATE', 'Enrollment', `Added batch/classroom transfer to enrollment ${updatedEnrollment.enrollment_no} to new batch ${batchId} and classroom ${newClassroomId}`, requestInfo);

    res.json({
      success: true,
      message: 'Batch transfer added successfully',
      data: updatedEnrollment
    });
  } catch (error) {
    logger.error('Error in addBatchTransfer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getBatchTransferHistory(req, res) {
  try {
    const { id } = req.params;
    const requestInfo = getRequestInfo(req);

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    await ActivityLogger.logActivity(req.user, 'READ', 'Enrollment', `Retrieved batch transfer history for enrollment ${enrollment.enrollment_no}`, requestInfo);

    res.json({
      success: true,
      data: enrollment.batchTransfers || []
    });
  } catch (error) {
    logger.error('Error in getBatchTransferHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function exportEnrollments(req, res) {
  try {
    const { search = '', courseId, batchId, format = 'csv' } = req.query;
    const requestInfo = getRequestInfo(req);

    const matchStage = {};

    if (courseId) {
      matchStage.courseId = new mongoose.Types.ObjectId(courseId);
    }

    if (batchId) {
      matchStage.batchId = new mongoose.Types.ObjectId(batchId);
    }

    // Use safe regex creation to prevent RegExp injection
    const { createSafeRegex } = require('../utils/regexUtils');
    const searchRegex = search.trim() !== '' ? createSafeRegex(search) : null;
    
    if (search.trim() !== '' && !searchRegex) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search term'
      });
    }

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
            { enrollment_no: searchRegex },
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

    const enrollments = await Enrollment.aggregate(aggregationPipeline);

    // Transform the data for export
    const exportData = enrollments.map((enrollment) => ({
      enrollmentNo: enrollment.enrollment_no,
      registrationNo: enrollment.student.registration_no,
      studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      nic: enrollment.student.nic,
      studentEmail: enrollment.student.email,
      studentMobile: enrollment.student.mobile,
      studentAddress: enrollment.student.address,
      courseName: enrollment.course.name,
      courseCode: enrollment.course.code,
      batchName: enrollment.batch.name,
      batchCode: enrollment.batch.code,
      enrollmentDate: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : '',
      createdAt: enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : '',
      updatedAt: enrollment.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString() : '',
      batchTransfersCount: enrollment.batchTransfers ? enrollment.batchTransfers.length : 0,
      lastBatchTransfer: enrollment.batchTransfers && enrollment.batchTransfers.length > 0 
        ? new Date(enrollment.batchTransfers[enrollment.batchTransfers.length - 1].date).toLocaleDateString() 
        : '',
      studentStatus: enrollment.student.status || 'pending'
    }));

    await ActivityLogger.logActivity(req.user, 'EXPORT', 'Enrollment', `Exported ${exportData.length} enrollments`, requestInfo);

    // Handle different export formats
    if (format.toLowerCase() === 'excel') {
      const excelBuffer = await generateExcel(exportData, enrollmentExportHeaders, 'Enrollments Export');
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=enrollments_export.xlsx');
      res.send(excelBuffer);
    } else {
      // Default CSV format
      const csvContent = generateCSV(exportData, enrollmentExportHeaders);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=enrollments_export.csv');
      res.send(csvContent);
    }
  } catch (error) {
    logger.error('Error in exportEnrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  getAllEnrollmentsByStudentId,
  exportEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  addBatchTransfer,
  getBatchTransferHistory
};
