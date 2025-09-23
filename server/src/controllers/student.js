// studentController.js

const Student = require("../models/student");
const Counter = require("../models/counter");
const Enrollment = require("../models/enrollment");
const RequiredDocument = require("../models/required_document");
const ActivityLogger = require("../utils/activityLogger");
const { getRequestInfo } = require("../middleware/requestInfo");
const multer = require('multer');
const xlsx = require('xlsx');

// utility calling
const { getNextSequenceValue, getAndFormatCourseEnrollmentNumber } = require('../utilities/counter'); 
const { generateCSV, generateExcel, studentExportHeaders } = require("../utils/exportUtils");

// Function to check if student has all required fields completed
function checkStudentCompletion(student) {
  // Check basic required fields (Step 1 - Required)
  const basicFields = [
    student.firstName,
    student.lastName,
    student.dob,
    student.nic,
    student.address,
    student.mobile,
    student.email
  ];

  // Check if any basic field is missing
  if (basicFields.some(field => !field)) {
    return false;
  }

  // Check if student has at least one enrollment (Step 2 - Required)
  // This is handled by the enrollment creation, so we assume it exists if student is created

  // Step 3: Academic Details (Required for completion)
  if (!student.highestAcademicQualification) {
    return false;
  }

  // Step 4: Required Documents (Required for completion)
  // Check if all required documents are provided
  if (!student.requiredDocuments || student.requiredDocuments.length === 0) {
    return false;
  }

  // We need to check against the actual required documents that have isRequired=true
  // This will be handled in the detailed status check function

  // Step 5: Emergency Contact (Required for completion)
  if (!student.emergencyContact || 
      !student.emergencyContact.name || 
      !student.emergencyContact.relationship || 
      !student.emergencyContact.phone) {
    return false;
  }

  return true;
}

// Function to get detailed completion status
async function getStudentCompletionStatus(student) {
  const status = {
    step1: false, // Personal Details
    step2: false, // Course Details (enrollment)
    step3: false, // Academic Details
    step4: false, // Required Documents
    step5: false, // Emergency Contact
    overall: 'pending'
  };

  // Step 1: Personal Details
  const basicFields = [
    student.firstName,
    student.lastName,
    student.dob,
    student.nic,
    student.address,
    student.mobile,
    student.email
  ];
  status.step1 = !basicFields.some(field => !field);

  // Step 2: Course Details (enrollment) - check if student has at least one enrollment
  const enrollmentCount = await Enrollment.countDocuments({ studentId: student._id });
  status.step2 = enrollmentCount > 0;

  // Step 3: Academic Details
  status.step3 = !!(student.highestAcademicQualification);

  // Step 4: Required Documents
  // Get all required documents from the database
  const allRequiredDocs = await RequiredDocument.find({ isRequired: true });
  
  if (allRequiredDocs.length === 0) {
    // If no required documents exist, step is considered complete
    status.step4 = true;
  } else {
    // Check if all required documents are provided
    const providedRequiredDocs = student.requiredDocuments?.filter(doc => 
      doc.isProvided && allRequiredDocs.some(reqDoc => 
        reqDoc._id.toString() === doc.documentId.toString()
      )
    ) || [];
    
    status.step4 = providedRequiredDocs.length === allRequiredDocs.length;
  }

  // Step 5: Emergency Contact
  status.step5 = !!(student.emergencyContact && 
                   student.emergencyContact.name && 
                   student.emergencyContact.relationship && 
                   student.emergencyContact.phone);              

  // Determine overall status
  if (status.step1 && status.step2 && status.step3 && status.step4 && status.step5) {
    status.overall = 'completed';
  } else if (status.step1 && status.step2) {
    status.overall = 'incomplete';
  } else {
    status.overall = 'pending';
  }

  return status;
} 

async function getAllStudents(req, res) {
  try {
    const { search = '', page = 1, limit = 10, sortBy = 'registration_no', sortOrder = 'asc' } = req.query;

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
          { address: searchRegex },

          // Match concatenated "firstName lastName"
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: searchRegex
              }
            }
          }
        ]
      };
    }

    // Build sort object
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    let sortObject = {};

    // Handle special case for full name sorting
    if (sortBy === 'fullName') {
      sortObject = {
        firstName: sortDirection,
        lastName: sortDirection
      };
    } else {
      sortObject[sortBy] = sortDirection;
    }

    const totalStudents = await Student.countDocuments(filter);

    let students;
    if (sortBy === 'fullName') {
      // For full name sorting, we need to use aggregation
      students = await Student.aggregate([
        { $match: filter },
        {
          $addFields: {
            fullName: { $concat: ['$firstName', ' ', '$lastName'] }
          }
        },
        { $sort: { fullName: sortDirection } },
        { $skip: skip },
        { $limit: limitNum }
      ]);
    } else {
      students = await Student.find(filter)
        .sort(sortObject)
        .skip(skip)
        .limit(limitNum);
    }

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

    // Get completion status for the student
    const completionStatus = await getStudentCompletionStatus(student);

    res.status(200).json({
      ...student.toObject(),
      completionStatus: completionStatus
    });
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
    // New fields
    highestAcademicQualification,
    qualificationDescription,
    requiredDocuments,
    emergencyContact,
  } = req.body;

  const requestInfo = getRequestInfo(req);

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
        const course = await require('../models/course').findById(courseId);
        const batch = await require('../models/batch').findById(batchId);
        const courseSequenceValue = course && batch 
          ? await getAndFormatCourseEnrollmentNumber(course.code, batch.name)
          : await getNextSequenceValue("course_id_sequence");

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

    // Build student data object with only defined optional fields
    const studentData = {
      firstName,
      lastName,
      dob,
      nic,
      address,
      mobile,
      homeContact,
      email,
      registration_no: sequenceValue,
    };

    // Only include optional fields if they have values
    if (highestAcademicQualification && highestAcademicQualification.trim() !== '') {
      studentData.highestAcademicQualification = highestAcademicQualification;
    }
    
    if (qualificationDescription && qualificationDescription.trim() !== '') {
      studentData.qualificationDescription = qualificationDescription;
    }
    
    if (requiredDocuments && requiredDocuments.length > 0) {
      studentData.requiredDocuments = requiredDocuments;
    }
    
    if (emergencyContact && 
        emergencyContact.name && emergencyContact.name.trim() !== '' &&
        emergencyContact.relationship && emergencyContact.relationship.trim() !== '' &&
        emergencyContact.phone && emergencyContact.phone.trim() !== '') {
      studentData.emergencyContact = emergencyContact;
    }

    const student = new Student(studentData);

    const newStudent = await student.save();

    // Get detailed completion status and update
    await newStudent.save();

    const course = await require('../models/course').findById(courseId);
    const batch = await require('../models/batch').findById(batchId);
    const courseSequenceValue = course && batch 
      ? await getAndFormatCourseEnrollmentNumber(course.code, batch.name)
      : await getNextSequenceValue("course_id_sequence");

    // Register new student for course and batch
    await courseRegistration(
      newStudent._id,
      courseId,
      batchId,
      sequenceValue,
      courseSequenceValue
    );

    // Log the student creation
    await ActivityLogger.logStudentCreate(req.user, newStudent, requestInfo.ipAddress, requestInfo.userAgent);
    
    // Update student status
    const completionStatus = await getStudentCompletionStatus(newStudent);
    newStudent.status = completionStatus.overall;
    await newStudent.save();

    let message = "New student registered for the course";
    if (completionStatus.overall === 'completed') {
      message = "Student registered successfully! Registration is complete.";
    } else if (completionStatus.overall === 'incomplete') {
      const missingSteps = [];
      if (!completionStatus.step3) missingSteps.push('Academic Details');
      if (!completionStatus.step4) missingSteps.push('Required Documents');
      if (!completionStatus.step5) missingSteps.push('Emergency Contact');
      message = `Student registered successfully! To complete registration, please provide: ${missingSteps.join(', ')}`;
    } else {
      message = "Student registered successfully! Registration is still pending.";
    }

    res.status(201).json({
      success: true,
      message: message,
      data: {
        studentId: newStudent._id,
        courseId,
        batchId,
        completionStatus: completionStatus
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
  const { 
    firstName, 
    lastName, 
    dob, 
    nic, 
    address, 
    mobile, 
    homeContact, 
    email,
    // New fields
    highestAcademicQualification,
    qualificationDescription,
    requiredDocuments,
    emergencyContact,
  } = req.body;
  const requestInfo = getRequestInfo(req);

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Store original values for logging
    const originalStudent = { ...student.toObject() };

    student.firstName = firstName;
    student.lastName = lastName;
    student.dob = dob;
    student.nic = nic;
    student.address = address;
    student.mobile = mobile;
    student.homeContact = homeContact;
    student.email = email;
    
    // Update optional fields only if they have values
    if (highestAcademicQualification !== undefined) {
      student.highestAcademicQualification = highestAcademicQualification;
    }
    if (qualificationDescription !== undefined) {
      student.qualificationDescription = qualificationDescription;
    }
    if (requiredDocuments !== undefined) {
      student.requiredDocuments = requiredDocuments;
    }
    if (emergencyContact !== undefined) {
      student.emergencyContact = emergencyContact;
    }

    // Get detailed completion status and update
    const completionStatus = await getStudentCompletionStatus(student);
    student.status = completionStatus.overall;

    await student.save();

    // Log the student update
    const changes = {
      firstName: { from: originalStudent.firstName, to: firstName },
      lastName: { from: originalStudent.lastName, to: lastName },
      dob: { from: originalStudent.dob, to: dob },
      nic: { from: originalStudent.nic, to: nic },
      address: { from: originalStudent.address, to: address },
      mobile: { from: originalStudent.mobile, to: mobile },
      homeContact: { from: originalStudent.homeContact, to: homeContact },
      email: { from: originalStudent.email, to: email },
      // New fields
      highestAcademicQualification: { from: originalStudent.highestAcademicQualification, to: highestAcademicQualification },
      qualificationDescription: { from: originalStudent.qualificationDescription, to: qualificationDescription },
      requiredDocuments: { from: originalStudent.requiredDocuments, to: requiredDocuments },
      emergencyContact: { from: originalStudent.emergencyContact, to: emergencyContact }
    };

    await ActivityLogger.logStudentUpdate(req.user, student, changes, requestInfo.ipAddress, requestInfo.userAgent);
    
    let message = "Student updated successfully";
    if (completionStatus.overall === 'completed') {
      message = "Student updated successfully! Registration is now complete.";
    } else if (completionStatus.overall === 'incomplete') {
      const missingSteps = [];
      if (!completionStatus.step3) missingSteps.push('Academic Details');
      if (!completionStatus.step4) missingSteps.push('Required Documents');
      if (!completionStatus.step5) missingSteps.push('Emergency Contact');
      message = `Student updated successfully! To complete registration, please provide: ${missingSteps.join(', ')}`;
    }

    res.status(200).json({
      success: true,
      message: message,
      data: {
        studentId: student._id,
        completionStatus: completionStatus
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

  console.log('AddCourseRegistration called with:', { studentId, courseId, batchId });

  try {
    // Check if the student is already registered for this course and batch
    const isDuplicate = await checkDuplicateCourseRegistration(studentId, courseId, batchId);

    if (isDuplicate) {
      return res.status(403).json({
        success: false,
        message: "Student already registered for this course with the same batch",
      });
    }

    const course = await require('../models/course').findById(courseId);
    const batch = await require('../models/batch').findById(batchId);
    const courseSequenceValue = course && batch 
      ? await getAndFormatCourseEnrollmentNumber(course.code, batch.name)
      : await getNextSequenceValue("course_id_sequence");

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await courseRegistration(studentId, courseId, batchId, student.registration_no, courseSequenceValue);

    // Check completion status after adding the new enrollment
    const completionStatus = await getStudentCompletionStatus(student);
    const previousStatus = student.status;
    
    // Update student status if it has changed
    if (student.status !== completionStatus.overall) {
      student.status = completionStatus.overall;
      await student.save();
    }

    // Prepare response message based on completion status
    let message = "Student registered for the course";
    if (completionStatus.overall === 'completed' && previousStatus !== 'completed') {
      message = "Student registered for the course. Student registration is now complete!";
    } else if (completionStatus.overall === 'incomplete') {
      const missingSteps = [];
      if (!completionStatus.step1) missingSteps.push('Personal Details');
      if (!completionStatus.step2) missingSteps.push('Course Enrollment');
      if (!completionStatus.step3) missingSteps.push('Academic Details');
      if (!completionStatus.step4) missingSteps.push('Required Documents');
      if (!completionStatus.step5) missingSteps.push('Emergency Contact');
      
      if (missingSteps.length > 0) {
        message = `Student registered for the course. Student registration is incomplete. Missing: ${missingSteps.join(', ')}`;
      }
    }

    res.status(201).json({
      success: true,
      message: message,
      data: {
        studentId,
        courseId,
        batchId,
        completionStatus: completionStatus
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
    const enrollment = await Enrollment.findByIdAndDelete(courseRegistrationId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
      data: {
        courseRegistrationId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting enrollment",
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
  const enrollment = await Enrollment.findOne({
    studentId,
    courseId,
    batchId,
  });
  return !!enrollment;
}

async function exportStudents(req, res) {
  try {
    const { search = '', sortBy = 'registration_no', sortOrder = 'asc', format = 'csv' } = req.query;
    const requestInfo = getRequestInfo(req);

    console.log('--- Export Students Request ---');
    console.log('Received Query Params:', { search, sortBy, sortOrder, format });
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('User:', req.user ? req.user._id : 'No user');

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

    // Build sort object
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    let sortObject = {};

    // Handle special case for full name sorting
    if (sortBy === 'fullName') {
      sortObject = {
        firstName: sortDirection,
        lastName: sortDirection
      };
    } else {
      sortObject[sortBy] = sortDirection;
    }

    let students;
    if (sortBy === 'fullName') {
      // For full name sorting, we need to use aggregation
      students = await Student.aggregate([
        { $match: filter },
        {
          $addFields: {
            fullName: { $concat: ['$firstName', ' ', '$lastName'] }
          }
        },
        { $sort: { fullName: sortDirection } }
      ]);
    } else {
      students = await Student.find(filter).sort(sortObject);
    }

    console.log('Students fetched from DB:', students.length);
    console.log('First student sample:', students[0] ? {
      registration_no: students[0].registration_no,
      firstName: students[0].firstName,
      lastName: students[0].lastName,
      status: students[0].status
    } : 'No students found');

    const exportData = students.map((student) => ({
      registrationNo: student.registration_no,
      firstName: student.firstName,
      lastName: student.lastName,
      nic: student.nic,
      dob: student.dob ? new Date(student.dob).toLocaleDateString() : '',
      address: student.address,
      mobile: student.mobile,
      homeContact: student.homeContact,
      email: student.email,
      status: student.status || 'pending',
      registrationDate: student.registrationDate ? new Date(student.registrationDate).toLocaleDateString() : '',
      highestAcademicQualification: student.highestAcademicQualification || '',
      qualificationDescription: student.qualificationDescription || '',
      emergencyContactName: student.emergencyContact?.name || '',
      emergencyContactRelationship: student.emergencyContact?.relationship || '',
      emergencyContactPhone: student.emergencyContact?.phone || '',
      emergencyContactEmail: student.emergencyContact?.email || '',
      emergencyContactAddress: student.emergencyContact?.address || '',
      requiredDocumentsCount: student.requiredDocuments ? student.requiredDocuments.length : 0,
      providedDocumentsCount: student.requiredDocuments ? student.requiredDocuments.filter(doc => doc.isProvided).length : 0
    }));

    console.log('Final export data count:', exportData.length);

    // Log the export activity
    try {
    await ActivityLogger.logStudentExport(req.user, exportData.length, requestInfo.ipAddress, requestInfo.userAgent);
    } catch (logError) {
      console.error('Error logging export activity:', logError);
      // Continue with export even if logging fails
    }

    console.log('Export format requested:', format);
    console.log('Export data count:', exportData.length);
    
    // Handle different export formats
    if (format.toLowerCase() === 'excel') {
      try {
        console.log('Generating Excel file...');
        const excelBuffer = await generateExcel(exportData, studentExportHeaders, 'Students Export');
        console.log('Excel buffer size:', excelBuffer.length);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=students_export.xlsx');
        res.send(excelBuffer);
        console.log('Excel file sent successfully');
      } catch (excelError) {
        console.error('Error generating Excel:', excelError);
        res.status(500).json({ error: "Failed to generate Excel file: " + excelError.message });
      }
    } else {
      // Default CSV format
      try {
        console.log('Generating CSV file...');
        const csvContent = generateCSV(exportData, studentExportHeaders);
        console.log('CSV content length:', csvContent.length);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students_export.csv');
        res.send(csvContent);
        console.log('CSV file sent successfully');
      } catch (csvError) {
        console.error('Error generating CSV:', csvError);
        res.status(500).json({ error: "Failed to generate CSV file: " + csvError.message });
      }
    }
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
  console.log('courseRegistration called with:', { studentId, courseId, batchId, sequenceValue, courseSequenceValue });
  
  const enrollment = new Enrollment({
    studentId,
    courseId,
    batchId,
    registration_no: sequenceValue,
    enrollment_no: courseSequenceValue,
    enrollmentDate: new Date(),
  });

  console.log('Creating enrollment with data:', enrollment);
  await enrollment.save();
  console.log('Enrollment saved successfully');
}

// Excel Import Function
async function importStudentsFromExcel(req, res) {
  const requestInfo = getRequestInfo(req);
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('Processing Excel file:', req.file.originalname);

    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Excel file must contain at least a header row and one data row"
      });
    }

    // Extract headers and data
    const headers = data[0];
    const rows = data.slice(1);

    console.log('Headers found:', headers);
    console.log('Number of data rows:', rows.length);

    // Validate required headers
    const requiredHeaders = [
      'First Name', 'Last Name', 'Date of Birth', 'NIC', 'Address', 
      'Mobile', 'Email'
    ];

    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required headers: ${missingHeaders.join(', ')}`
      });
    }

    // Process each row
    const results = {
      total: rows.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because we start from row 2 (after header)

      try {
        // Map row data to student object
        const studentData = {
          firstName: row[headers.indexOf('First Name')]?.toString().trim(),
          lastName: row[headers.indexOf('Last Name')]?.toString().trim(),
          dob: row[headers.indexOf('Date of Birth')]?.toString().trim(),
          nic: row[headers.indexOf('NIC')]?.toString().trim(),
          address: row[headers.indexOf('Address')]?.toString().trim(),
          mobile: row[headers.indexOf('Mobile')]?.toString().trim(),
          email: row[headers.indexOf('Email')]?.toString().trim(),
          homeContact: row[headers.indexOf('Home Contact')]?.toString().trim() || '',
          highestAcademicQualification: row[headers.indexOf('Academic Qualification')]?.toString().trim() || '',
          qualificationDescription: row[headers.indexOf('Qualification Description')]?.toString().trim() || '',
          courseCode: row[headers.indexOf('Course Code')]?.toString().trim(),
          batchName: row[headers.indexOf('Batch Name')]?.toString().trim(),
          emergencyContactName: row[headers.indexOf('Emergency Contact Name')]?.toString().trim() || '',
          emergencyContactRelationship: row[headers.indexOf('Emergency Contact Relationship')]?.toString().trim() || '',
          emergencyContactPhone: row[headers.indexOf('Emergency Contact Phone')]?.toString().trim() || '',
          emergencyContactEmail: row[headers.indexOf('Emergency Contact Email')]?.toString().trim() || '',
          emergencyContactAddress: row[headers.indexOf('Emergency Contact Address')]?.toString().trim() || ''
        };

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'dob', 'nic', 'address', 'mobile', 'email'];
        const missingFields = requiredFields.filter(field => !studentData[field]);
        
        if (missingFields.length > 0) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
          continue;
        }

        // Check if student already exists (by NIC)
        const existingStudent = await Student.findOne({ nic: studentData.nic });
        if (existingStudent) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: Student with NIC ${studentData.nic} already exists`);
          continue;
        }

        // Find course and batch by code/name (optional)
        let course = null;
        let batch = null;
        
        if (studentData.courseCode) {
          const Course = require('../models/course');
          course = await Course.findOne({ courseCode: studentData.courseCode });
          if (!course) {
            results.failed++;
            results.errors.push(`Row ${rowNumber}: Course with code "${studentData.courseCode}" not found`);
            continue;
          }

          if (studentData.batchName) {
            const Batch = require('../models/batch');
            batch = await Batch.findOne({ 
              name: { $regex: new RegExp(studentData.batchName, 'i') },
              courseId: course._id 
            });
            if (!batch) {
              results.failed++;
              results.errors.push(`Row ${rowNumber}: Batch "${studentData.batchName}" not found for course "${course.name}" (Code: ${studentData.courseCode})`);
              continue;
            }
          }
        }

        // Create student
        const sequenceValue = await getNextSequenceValue("unique_id_sequence");
        
        const student = new Student({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dob: new Date(studentData.dob),
          nic: studentData.nic,
          address: studentData.address,
          mobile: studentData.mobile,
          homeContact: studentData.homeContact,
          email: studentData.email,
          registration_no: sequenceValue,
          highestAcademicQualification: studentData.highestAcademicQualification,
          qualificationDescription: studentData.qualificationDescription,
          emergencyContact: studentData.emergencyContactName ? {
            name: studentData.emergencyContactName,
            relationship: studentData.emergencyContactRelationship,
            phone: studentData.emergencyContactPhone,
            email: studentData.emergencyContactEmail,
            address: studentData.emergencyContactAddress
          } : undefined
        });

        const newStudent = await student.save();

        // Get completion status and update
        const completionStatus = await getStudentCompletionStatus(newStudent);
        newStudent.status = completionStatus.overall;
        await newStudent.save();

        // Create enrollment (only if course and batch are provided)
        if (course && batch) {
          const courseSequenceValue = await getAndFormatCourseEnrollmentNumber(course.code, batch.name);
          await courseRegistration(
            newStudent._id,
            course._id,
            batch._id,
            sequenceValue,
            courseSequenceValue
          );
        }

        // Log the student creation
        await ActivityLogger.logStudentCreate(req.user, newStudent, requestInfo.ipAddress, requestInfo.userAgent);

        results.successful++;

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    console.log('Import results:', results);

    res.status(200).json({
      success: true,
      message: `Import completed. ${results.successful} students imported successfully, ${results.failed} failed.`,
      data: results
    });

  } catch (error) {
    console.error('Error in importStudentsFromExcel:', error);
    res.status(500).json({
      success: false,
      message: "Error processing Excel file",
      error: error.message
    });
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  AddCourseRegistration,
  deleteCourseRegistration,
  exportStudents,
  importStudentsFromExcel,
  getStudentCompletionStatus,
};
