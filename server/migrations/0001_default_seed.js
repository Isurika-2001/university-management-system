require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const logger = require('../src/utils/logger');

// Models
const Counter = require('../src/models/counter');
const User = require('../src/models/user');
const User_type = require('../src/models/user_type');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/university-management-system';

async function run() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('Connected to MongoDB for default seeding');

    // Initialize counters
    const counters = ['unique_id_sequence', 'course_id_sequence'];
    for (const counterName of counters) {
      const existingCounter = await Counter.findById(counterName);
      if (!existingCounter) {
        await Counter.create({ _id: counterName, sequence_value: 999 });
        logger.info(`Counter '${counterName}' initialized to 999`);
      } else {
        logger.info(`Counter '${counterName}' already exists`);
      }
    }

    // Create default user types if not present
    const userTypes = [
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
        requiredDocument: 'CRUD'
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
        reports: 'R'
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
        reports: 'R'
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
        reports: 'R'
      },
      {
        name: 'examinar',
        displayName: 'Examinar',
        user: 'R',
        student: 'R',
        course: 'R',
        batch: 'R',
        enrollments: 'R',
        finance: 'R',
        reports: 'R',
        classrooms: 'R',
        modules: 'R',
        exams: 'CRUD'
      },
      {
        name: 'counselor',
        displayName: 'Counselor',
        user: 'R',
        student: 'CRUD',
        course: 'R',
        batch: 'R',
        enrollments: 'CRUD',
        finance: 'R',
        reports: 'R',
        classrooms: 'R',
        modules: 'R',
        exams: 'R'
      }
    ];

    for (const ut of userTypes) {
      const existing = await User_type.findOne({ name: ut.name });
      if (!existing) {
        await User_type.create(ut);
        logger.info(`User type '${ut.displayName}' created`);
      } else {
        logger.info(`User type '${ut.displayName}' already exists`);
      }
    }

    // Create default system administrator user
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'demo-admin@mail.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'demo-admin-mail';

    const systemAdminUserType = await User_type.findOne({ name: 'system_administrator' });
    if (!systemAdminUserType) {
      logger.error('System Administrator user type not found (seeding aborted)');
    } else {
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const newAdmin = await User.create({ name: 'Demo System Administrator', email: adminEmail, password: hashedPassword, user_type: systemAdminUserType._id });
        logger.info('Default system administrator user created:', newAdmin.email);
      } else {
        logger.info('Default system administrator user already exists:', existingAdmin.email);
      }
    }

    logger.info('Default seeding completed');
  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

if (require.main === module) run();

module.exports = { run };
