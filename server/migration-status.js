const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/student');

// Function to check if student has all required fields completed
function checkStudentCompletion(student) {
  // Check basic required fields
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

  // Check academic qualification fields
  if (!student.highestAcademicQualification || !student.qualificationDescription) {
    return false;
  }

  // Check emergency contact fields
  if (!student.emergencyContact || 
      !student.emergencyContact.name || 
      !student.emergencyContact.relationship || 
      !student.emergencyContact.phone) {
    return false;
  }

  // Check if at least one required document is provided
  if (!student.requiredDocuments || student.requiredDocuments.length === 0) {
    return false;
  }

  // Check if at least one document is marked as provided
  const hasProvidedDocuments = student.requiredDocuments.some(doc => doc.isProvided);
  if (!hasProvidedDocuments) {
    return false;
  }

  return true;
}

async function migrateStudentStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students to migrate`);

    let completedCount = 0;
    let incompleteCount = 0;
    let pendingCount = 0;

    for (const student of students) {
      const isCompleted = checkStudentCompletion(student);
      const newStatus = isCompleted ? 'completed' : 'incomplete';
      
      // Update student status
      await Student.findByIdAndUpdate(student._id, { status: newStatus });
      
      if (newStatus === 'completed') {
        completedCount++;
      } else if (newStatus === 'incomplete') {
        incompleteCount++;
      } else {
        pendingCount++;
      }
    }

    console.log('Migration completed successfully!');
    console.log(`- Completed: ${completedCount}`);
    console.log(`- Incomplete: ${incompleteCount}`);
    console.log(`- Pending: ${pendingCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateStudentStatus();
