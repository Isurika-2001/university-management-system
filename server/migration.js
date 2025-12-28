require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./src/utils/logger');

// Import models
const Student = require('./src/models/student');
const Course = require('./src/models/course');
const Enrollment = require('./src/models/enrollment');
const User_type = require('./src/models/user_type');
const RequiredDocument = require('./src/models/required_document');

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to MongoDB for migration');

    // 1. Update existing students with new fields
    logger.info('Updating existing students...');
    const students = await Student.find({});
    
    for (const student of students) {
      const updates = {};
      
      // Add registration date if not exists
      if (!student.registrationDate) {
        updates.registrationDate = student.createdAt || new Date();
      }
      
      // Add default academic qualification if not exists
      if (!student.highestAcademicQualification) {
        updates.highestAcademicQualification = 'O-Level';
        updates.qualificationDescription = 'Not specified';
      }
      
      // Add default emergency contact if not exists
      if (!student.emergencyContact) {
        updates.emergencyContact = {
          name: 'Not specified',
          relationship: 'Not specified',
          phone: 'Not specified'
        };
      }
      
      // Add empty required documents array if not exists
      if (!student.requiredDocuments) {
        updates.requiredDocuments = [];
      }
      
      if (Object.keys(updates).length > 0) {
        await Student.findByIdAndUpdate(student._id, updates);
        logger.info(`Updated student: ${student.firstName} ${student.lastName}`);
      }
    }

    // 2. Update existing courses with new fields
    logger.info('Updating existing courses...');
    const courses = await Course.find({});
    
    for (const course of courses) {
      const updates = {};
      
      // Add default values for new fields
      if (!course.prerequisites) {
        updates.prerequisites = 'None';
      }
      
      if (!course.courseCredits) {
        updates.courseCredits = 3; // Default value
      }
      
      if (!course.courseDuration) {
        updates.courseDuration = '1 year'; // Default value
      }
      
      if (course.weekdayBatch === undefined) {
        updates.weekdayBatch = false;
      }
      
      if (course.weekendBatch === undefined) {
        updates.weekendBatch = false;
      }
      
      if (Object.keys(updates).length > 0) {
        await Course.findByIdAndUpdate(course._id, updates);
        logger.info(`Updated course: ${course.name}`);
      }
    }

    // 3. Update existing enrollments (course registrations)
    logger.info('Updating existing enrollments...');
    const enrollments = await Enrollment.find({});
    
    for (const enrollment of enrollments) {
      const updates = {};
      
      // Add enrollment date if not exists
      if (!enrollment.enrollmentDate) {
        updates.enrollmentDate = enrollment.createdAt || new Date();
      }
      
      // Add empty batch transfers array if not exists
      if (!enrollment.batchTransfers) {
        updates.batchTransfers = [];
      }
      
      if (Object.keys(updates).length > 0) {
        await Enrollment.findByIdAndUpdate(enrollment._id, updates);
        logger.info(`Updated enrollment: ${enrollment.enrollment_no || enrollment.courseReg_no || enrollment._id}`);
      }
    }

    // 4. Create default required documents
    logger.info('Creating default required documents...');
    const defaultDocuments = [
      {
        name: 'Birth Certificate',
        description: 'Original or certified copy of birth certificate'
      },
      {
        name: 'NIC/Passport',
        description: 'National Identity Card or Passport copy'
      },
      {
        name: 'Educational Certificates',
        description: 'Previous educational certificates and transcripts'
      },
      {
        name: 'Passport Size Photos',
        description: 'Recent passport size photographs (4 copies)'
      },
      {
        name: 'Medical Certificate',
        description: 'Medical fitness certificate from a registered doctor'
      }
    ];

    for (const doc of defaultDocuments) {
      const existingDoc = await RequiredDocument.findOne({ name: doc.name });
      if (!existingDoc) {
        await RequiredDocument.create(doc);
        logger.info(`Created required document: ${doc.name}`);
      }
    }

    // 5. Update user types (roles)
    logger.info('Updating user types...');
    
    // Remove old roles and create new ones
    await User_type.deleteMany({});
    
    const newUserTypes = [
      {
        name: 'system_administrator',
        displayName: 'System Administrator',
        user: 'CRUD',
        student: 'CRUD',
        course: 'CRUD',
        batch: 'CRUD',
        enrollments: 'CRUD',
        finance: 'CRUD',
        reports: 'CRUD',
      },
      {
        name: 'academic_administrator',
        displayName: 'Academic Administrator',
        user: 'R',
        student: 'CRUD',
        course: 'CRUD',
        batch: 'CRUD',
        enrollments: 'CRUD',
        finance: 'R',
        reports: 'R',
      },
      {
        name: 'finance_admin',
        displayName: 'Finance Administrator',
        user: 'R',
        student: 'R',
        course: 'R',
        batch: 'R',
        enrollments: 'R',
        finance: 'CRUD',
        reports: 'R',
      },
      {
        name: 'accountant',
        displayName: 'Accountant',
        user: 'R',
        student: 'R',
        course: 'R',
        batch: 'R',
        enrollments: 'R',
        finance: 'CRUD',
        reports: 'R',
      },
    ];

    for (const userType of newUserTypes) {
      await User_type.create(userType);
      logger.info(`Created user type: ${userType.displayName}`);
    }

    logger.info('Migration completed successfully!');
    
  } catch (error) {
    logger.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run migration
migrateData();
