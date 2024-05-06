// studentController.js

const Student = require("../models/student");
const Counter = require("../models/counter");

async function getAllStudents(req, res) {
  try {
    const students = await Student.find()
      .populate("courseId")
      .populate("batchId");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getStudentById(req, res) {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId)
      .populate("courseId")
      .populate("batchId");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createStudent(req, res) {
  const {
    firstName,
    lastName,
    dob,
    nic,
    address,
    mobile,
    homeContact,
    email,
    courseId,
    batchId,
  } = req.body;

  // Check if the student is already registered for the same course with the same batch
  const isDuplicate = await checkDuplicateRegistration(courseId, batchId, nic);
  if (isDuplicate) {
    return res.status(403).json({ error: "Student already registered" });
  }

  const sequenceValue = await getNextSequenceValue("unique_id_sequence");

  const student = new Student({
    firstName,
    lastName,
    dob,
    nic,
    address,
    mobile,
    homeContact,
    email,
    registration_no: sequenceValue,
    courseId,
    batchId,
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { returnOriginal: false, upsert: true }
  );
  return counter.sequence_value;
}

// seperate function to check if same student is already registered for the same course with the same batch
async function checkDuplicateRegistration(courseId, batchId, nic) {
  const student = await Student.findOne({ courseId, batchId, nic });
  return !!student; // Return true if a student is found, indicating duplication
}

// Implement other controller functions

module.exports = { getAllStudents, getStudentById, createStudent };
