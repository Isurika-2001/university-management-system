const Exam = require('../models/exam');
const ExamMark = require('../models/exam_mark');
const ClassroomStudent = require('../models/classroom_student');
const { STATUSES } = require('../config/statuses');

const PASS_THRESHOLD = 40;

async function getAllExams(req, res) {
  try {
    const exams = await Exam.find().populate('classroomId').sort({ createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('getAllExams error', err);
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
    console.error('createExam error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getExamsByClassroom(req, res) {
  try {
    const { classroomId } = req.params;
    const exams = await Exam.find({ classroomId }).sort({ createdAt: -1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('getExamsByClassroom', err);
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
    console.error('getExam', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// body: { takeType, mark }
async function addMark(req, res) {
  try {
    const { id } = req.params; // exam id
    const { studentId, takeType = 'fresh', mark } = req.body;
    if (!studentId || typeof mark !== 'number') return res.status(400).json({ success: false, message: 'studentId and numeric mark required' });

    const exam = await Exam.findById(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const passed = mark >= PASS_THRESHOLD;

    let examMark = await ExamMark.findOne({ examId: id, studentId });
    if (!examMark) {
      examMark = await ExamMark.create({ examId: id, studentId, takes: [{ type: takeType, mark, passed }] });
    } else {
      examMark.takes.push({ type: takeType, mark, passed });
      await examMark.save();
    }

    // Update classroom student status based on latest take
    const classroomStudent = await ClassroomStudent.findOne({ classroomId: exam.classroomId, studentId });
    if (classroomStudent) {
      classroomStudent.status = passed ? STATUSES.PASS : STATUSES.FAIL;
      await classroomStudent.save();
    }

    res.json({ success: true, data: examMark });
  } catch (err) {
    console.error('addMark', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllExams, createExam, getExamsByClassroom, getExam, addMark };
