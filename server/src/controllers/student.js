// studentController.js

const Student = require("../models/student");
const Counter = require("../models/counter");
const CourseRegistration = require("../models/course_registration");

// utility calling
const { getNextSequenceValue } = require('../utilities/counter'); 

async function getAllStudents(req, res) {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build a filter that searches across multiple fields if search is not empty
    let filter = {};

    if (search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive regex

      filter = {
        $or: [
          { registration_no: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { nic: searchRegex },
          { mobile: searchRegex },
          { homeContact: searchRegex },
          { address: searchRegex }
        ]
      };
    }

    const totalStudents = await Student.countDocuments(filter);

    const students = await Student.find(filter)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      total: totalStudents,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalStudents / limitNum),
      data: students,
    });
  } catch (error) {
    console.error(error);
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

  try {
    // Check if the student is already registered in the system
    const isDuplicate = await checkDuplicateRegistration(nic);

    if (isDuplicate) {
      const student = await Student.findOne({ nic });

      // Check if the student is already registered for the same course and batch
      const isCourseDuplicate = await checkDuplicateCourseRegistration(
        student._id,
        courseId,
        batchId
      );

      if (isCourseDuplicate) {
        return res.status(403).json({
          success: false,
          message: "Student already registered for this course with the same batch",
        });
      } else {
        // Register the existing student for the new course and batch
        const courseSequenceValue = await getNextSequenceValue("course_id_sequence");

        await courseRegistration(
          student._id,
          courseId,
          batchId,
          student.registration_no,
          courseSequenceValue
        );

        return res.status(201).json({
          success: true,
          message: "Existing student registered for the new course",
          data: {
            studentId: student._id,
            courseId,
            batchId,
          },
        });
      }
    }

    // New student registration
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

    const newStudent = await student.save();

    const courseSequenceValue = await getNextSequenceValue("course_id_sequence");

    // Register new student for course and batch
    await courseRegistration(
      newStudent._id,
      courseId,
      batchId,
      sequenceValue,
      courseSequenceValue
    );

    res.status(201).json({
      success: true,
      message: "New student registered for the course",
      data: {
        studentId: newStudent._id,
        courseId,
        batchId,
      },
    });
  } catch (error) {
    console.error(error); // Log for debugging

    res.status(500).json({
      success: false,
      message: "Error registering student",
      error: error.message,
    });
  }
}

async function updateStudent(req, res) {
  const studentId = req.params.id;
  const { firstName, lastName, dob, nic, address, mobile, homeContact, email } = req.body;

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
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

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        studentId: student._id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message,
    });
  }
}

async function AddCourseRegistration(req, res) {
  const studentId = req.params.id;
  const { courseId, batchId } = req.body;

  try {
    // Check if the student is already registered for this course and batch
    const isDuplicate = await checkDuplicateCourseRegistration(studentId, courseId, batchId);

    if (isDuplicate) {
      return res.status(403).json({
        success: false,
        message: "Student already registered for this course with the same batch",
      });
    }

    const courseSequenceValue = await getNextSequenceValue("course_id_sequence");

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await courseRegistration(studentId, courseId, batchId, student.registration_no, courseSequenceValue);

    res.status(201).json({
      success: true,
      message: "Student registered for the course",
      data: {
        studentId,
        courseId,
        batchId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error registering student for course",
      error: error.message,
    });
  }
}

async function deleteCourseRegistration(req, res) {
  const courseRegistrationId = req.params.id;

  try {
    const courseRegistration = await CourseRegistration.findByIdAndDelete(courseRegistrationId);

    if (!courseRegistration) {
      return res.status(404).json({
        success: false,
        message: "Course registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course registration deleted successfully",
      data: {
        courseRegistrationId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting course registration",
      error: error.message,
    });
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

async function exportStudents(req, res) {
  try {
    const { search = '' } = req.query;

    console.log('--- Export Students Request ---');
    console.log('Received Query Params:', { search });

    let filter = {};

    if (search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive regex

      filter = {
        $or: [
          { registration_no: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { nic: searchRegex },
          { mobile: searchRegex },
          { homeContact: searchRegex },
          { address: searchRegex }
        ]
      };
    }

    console.log('MongoDB Filter:', filter);

    const students = await Student.find(filter);

    console.log('Students fetched from DB:', students.length);

    const exportData = students.map((student) => ({
      registrationNo: student.registration_no,
      firstName: student.firstName,
      lastName: student.lastName,
      nic: student.nic,
      dob: student.dob,
      address: student.address,
      mobile: student.mobile,
      homeContact: student.homeContact,
      email: student.email
    }));

    console.log('Final export data count:', exportData.length);

    res.status(200).json({
      total: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Error in exportStudents:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function courseRegistration(
  studentId,
  courseId,
  batchId,
  sequenceValue,
  courseSequenceValue,
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

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  AddCourseRegistration,
  deleteCourseRegistration,
  exportStudents,
};
