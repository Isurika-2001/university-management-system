const Exam = require('../models/exam');
const ExamMark = require('../models/exam_mark');
const ClassroomStudent = require('../models/classroom_student');
const { STATUSES } = require('../config/statuses');
const logger = require('../utils/logger');

const PASS_THRESHOLD = 40;

async function getAllExams(req, res) {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', courseId, batchId } = req.query;

    const pageNum = parseInt(page, 10) || 0;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = pageNum * limitNum;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // First, get all exams with populated classroom data
    let exams = await Exam.find(filter)
      .populate({
        path: 'classroomId',
        populate: [
          { path: 'courseId', select: 'name code' },
          { path: 'batchId', select: 'name' }
        ]
      })
      .sort(sort);

    // Filter by courseId if provided
    if (courseId) {
      exams = exams.filter(exam => {
        const classroom = exam.classroomId;
        return classroom && classroom.courseId && classroom.courseId._id.toString() === courseId;
      });
    }

    // Filter by batchId if provided
    if (batchId) {
      exams = exams.filter(exam => {
        const classroom = exam.classroomId;
        return classroom && classroom.batchId && classroom.batchId._id.toString() === batchId;
      });
    }

    const totalExams = exams.length;
    const paginatedExams = exams.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: paginatedExams,
      pagination: {
        total: totalExams,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalExams / limitNum)
      }
    });
  } catch (err) {
    logger.error('getAllExams error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createExam(req, res) {
  try {
    const { classroomId, name, date, description } = req.body;
    if (!classroomId || !name) return res.status(400).json({ success: false, message: 'classroomId and name required' });
    const exam = await Exam.create({ classroomId, name, date, description });
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    logger.error('createExam error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getExamsByClassroom(req, res) {
  try {
    const { classroomId } = req.params;
    const exams = await Exam.find({ classroomId }).sort({ createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    logger.error('getExamsByClassroom', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getExam(req, res) {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const marks = await ExamMark.find({ examId: id }).populate('studentId');
    res.json({ success: true, data: { exam, marks } });
  } catch (err) {
    logger.error('getExam', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// body: { takeType, mark }
async function addMark(req, res) {
  try {
    const { id } = req.params; // exam id
    const { studentId, takeType = 'fresh', mark } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });

    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    let passed;
    if (typeof mark === 'number') {
      passed = mark >= PASS_THRESHOLD;
    }

    let examMark = await ExamMark.findOne({ examId: id, studentId });
    if (!examMark) {
      examMark = await ExamMark.create({ examId: id, studentId, takes: [{ type: takeType, mark, passed }] });
    } else {
      examMark.takes.push({ type: takeType, mark, passed });
      await examMark.save();
    }

    // Update classroom student status based on latest take
    if (passed !== undefined) {
      const classroomStudent = await ClassroomStudent.findOne({ classroomId: exam.classroomId, studentId });
      if (classroomStudent) {
        classroomStudent.status = passed ? STATUSES.PASS : STATUSES.FAIL;
        await classroomStudent.save();
      }
    }

    res.json({ success: true, data: examMark });
  } catch (err) {
    logger.error('addMark', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateMark(req, res) {
  try {
    const { examMarkId, takeId } = req.params;
    const { mark } = req.body;

    if (typeof mark !== 'number') {
      return res.status(400).json({ success: false, message: 'Numeric mark required' });
    }

    const examMark = await ExamMark.findById(examMarkId).populate('examId');
    if (!examMark) {
      return res.status(404).json({ success: false, message: 'Exam mark not found' });
    }

    const take = examMark.takes.id(takeId);
    if (!take) {
      return res.status(404).json({ success: false, message: 'Take not found' });
    }

    take.mark = mark;
    take.passed = mark >= PASS_THRESHOLD;

    await examMark.save();

    // Update classroom student status based on this take
    const classroomStudent = await ClassroomStudent.findOne({
      classroomId: examMark.examId.classroomId,
      studentId: examMark.studentId
    });

    if (classroomStudent) {
      // Logic to determine overall status might be needed if there are multiple takes
      // For now, just use the status of the updated take
      classroomStudent.status = take.passed ? STATUSES.PASS : STATUSES.FAIL;
      await classroomStudent.save();
    }

    res.json({ success: true, data: examMark });
  } catch (err) {
    logger.error('updateMark error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllExams, createExam, getExamsByClassroom, getExam, addMark, updateMark };
