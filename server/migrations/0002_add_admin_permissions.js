require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

const User_type = require('../src/models/user_type');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  logger.info('Using Mongo URI:', mongoUri);

  try {
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for permission migration');

    // Match: "System Administrator" OR "system_administrator"
    const admin = await User_type.findOne({
      $or: [
        { name: /system administrator/i },
        { name: /system_administrator/i }
      ]
    });

    if (!admin) {
      logger.error('❌ System Administrator role not found (name mismatch)');
      return;
    }

    await User_type.updateOne(
      { _id: admin._id },
      {
        $set: {
          classrooms: 'CRUD',
          modules: 'CRUD',
          exams: 'CRUD'
        }
      }
    );

    logger.info('✅ Ensured System Administrator permissions (classrooms, modules, exams)');

  } catch (err) {
    logger.error('❌ Permission migration failed:', err);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
