// studentController.js

const Student = require("../models/student");
const Counter = require("../models/counter");
const CourseRegistration = require("../models/course_registration");

async function getAllStudents(req, res) {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getStudentById(req, res) {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);

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

  // Check if the student is already registered for the system
  const isDuplicate = await checkDuplicateRegistration(nic);
  if (isDuplicate) {
    const student = await Student.findOne({ nic });
    // check if the student is already registered for the same course with the same batch
    const isCourseDuplicate = await checkDuplicateCourseRegistration(
      student._id,
      courseId,
      batchId
    );
    if (isCourseDuplicate) {
      return res.status(403).json({
        error: "Student already registered for this course with the same batch",
      });
    } else {
      // register the student for the course and batch with the same registration number
      const courseSequenceValue = await getNextSequenceValue(
        "course_id_sequence"
      );

      await courseRegistration(
        student._id,
        courseId,
        batchId,
        student.registration_no,
        courseSequenceValue
      );
      return res
        .status(201)
        .json({ message: "Existing student registered for the new course" });
    }
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
  });

  try {
    const newStudent = await student.save();

    // get the saved student document
    const savedStudent = await Student.findById(student._id);

    const courseSequenceValue = await getNextSequenceValue(
      "course_id_sequence"
    );

    // new course registration using the function
    await courseRegistration(
      savedStudent._id,
      courseId,
      batchId,
      sequenceValue,
      courseSequenceValue
    );

    res.status(202).json({ message: "New student registered for the course" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateStudent(req, res) {
  const studentId = req.params.id;
  const { firstName, lastName, dob, nic, address, mobile, homeContact, email } =
    req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.firstName = firstName;
    student.lastName = lastName;
    student.dob = dob;
    student.nic = nic;
    student.address = address;
    student.mobile = mobile;
    student.homeContact = homeContact;
    student.email = email;

    await student.save();

    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function AddCourseRegistration(req, res) {
  const studentId = req.params.id;
  const { courseId, batchId } = req.body;

  // Check if the student is already registered for the system
  const isDuplicate = await checkDuplicateCourseRegistration(
    studentId,
    courseId,
    batchId
  );
  if (isDuplicate) {
    return res.status(403).json({
      error: "Student already registered for this course with the same batch",
    });
  }
  
  const courseSequenceValue = await getNextSequenceValue("course_id_sequence");

  // get the registration number of the student
  const student = await Student.findById(studentId);

  try {
    await courseRegistration(studentId, courseId, batchId, student.registration_no, courseSequenceValue);
    res.status(201).json({ message: "Student registered for the course" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteCourseRegistration(req, res) {
  const courseRegistrationId = req.params.id;

  try {
    const courseRegistration = await CourseRegistration.findByIdAndDelete(
      courseRegistrationId
    );

    if (!courseRegistration) {
      return res.status(404).json({ error: "Course registration not found" });
    }

    res.status(200).json({ message: "Course registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// seperate function to check if same student is already registered for the same course with the same batch
async function checkDuplicateRegistration(nic) {
  const student = await Student.findOne({ nic });
  return !!student; // Return true if a student is found, indicating duplication
}

async function checkDuplicateCourseRegistration(studentId, courseId, batchId) {
  const courseRegistration = await CourseRegistration.findOne({
    studentId,
    courseId,
    batchId,
  });
  return !!courseRegistration;
}

async function courseRegistration(
  studentId,
  courseId,
  batchId,
  sequenceValue,
  courseSequenceValue
) {
  const courseRegistration = new CourseRegistration({
    studentId,
    courseId,
    batchId,
    registration_no: sequenceValue,
    courseReg_no: courseSequenceValue,
  });

  await courseRegistration.save();
}

async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { returnOriginal: false, upsert: true }
  );
  return counter.sequence_value;
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  AddCourseRegistration,
  deleteCourseRegistration,
};
