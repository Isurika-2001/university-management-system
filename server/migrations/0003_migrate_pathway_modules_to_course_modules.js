require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

const Course = require('../src/models/course');
const CourseModule = require('../src/models/module');
const ModuleEntry = require('../src/models/module_entry');
const Classroom = require('../src/models/classroom');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  logger.info('Starting migration 0003: pathway modules -> course modules & module entries');
  try {
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Read old pathway-module documents from the legacy collection 'pathwaymodules'
    const legacyCollection = mongoose.connection.collection('pathwaymodules');
    const legacyDocs = await legacyCollection.find().toArray();

    logger.info('Found', legacyDocs.length, 'legacy pathway-module documents');

    for (const doc of legacyDocs) {
      try {
        const pathway = doc.pathway;
        const modules = Array.isArray(doc.modules) ? doc.modules : [];

        // Find courses that belong to this pathway
        const courses = await Course.find({ pathway }).lean();
        logger.info(`Pathway ${pathway} -> ${courses.length} courses`);

        for (const course of courses) {
          // Upsert CourseModule document for this course
          await CourseModule.findOneAndUpdate(
            { courseId: course._id },
            { $set: { modules } },
            { upsert: true, new: true }
          );

          // Create ModuleEntry documents for each module name
          for (const mName of modules) {
            try {
              await ModuleEntry.updateOne(
                { courseId: course._id, name: mName },
                { $set: { courseId: course._id, name: mName } },
                { upsert: true }
              );
            } catch (innerErr) {
              logger.error('Error creating ModuleEntry', course._id, mName, innerErr.message);
            }
          }
        }
      } catch (err) {
        logger.error('Error processing legacy doc', doc, err.message);
      }
    }

    // Migrate existing classrooms: set moduleId based on moduleName + courseId
    const classrooms = await Classroom.find().lean();
    logger.info('Migrating', classrooms.length, 'classrooms');

    for (const cr of classrooms) {
      try {
        if (!cr.moduleName || !cr.courseId) continue;

        const moduleDoc = await ModuleEntry.findOne({ courseId: cr.courseId, name: cr.moduleName }).lean();
        if (moduleDoc) {
          await Classroom.updateOne({ _id: cr._id }, { $set: { moduleId: moduleDoc._id } });
        }
      } catch (err) {
        logger.error('Error migrating classroom', cr._id, err.message);
      }
    }

    logger.info('Migration 0003 completed');
  } catch (err) {
    logger.error('Migration 0003 failed:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };