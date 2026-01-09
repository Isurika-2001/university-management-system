const CourseModule = require('../models/module');
const Course = require('../models/course');
const logger = require('../utils/logger');

async function getAllModules(req, res) {
  try {
    const { courseId } = req.query;

    // If a specific courseId is requested, return modules array for that course
    if (courseId) {
      // Return individual ModuleEntry documents for the course (with ids, names, courseId, and sequential info)
      const ModuleEntry = require('../models/module_entry');
      const entries = await ModuleEntry.find({ courseId })
        .select('_id name courseId isSequential sequenceNumber')
        .sort({ isSequential: -1, sequenceNumber: 1, name: 1 })
        .lean();

      // If ModuleEntry docs exist, return them. Otherwise fall back to CourseModule (legacy list of names)
      if (entries && entries.length > 0) {
        return res.status(200).json({ success: true, data: entries });
      }

      // Fallback: check CourseModule document for this course and return module names as objects
      const cm = await CourseModule.findOne({ courseId }).lean();
      if (cm && Array.isArray(cm.modules)) {
        const fallback = cm.modules.map((name, _idx) => ({ 
          _id: null, 
          name, 
          courseId,
          isSequential: false,
          sequenceNumber: null
        }));
        return res.status(200).json({ success: true, data: fallback });
      }

      return res.status(200).json({ success: true, data: [] });
    }

    // For listing all courses with modules, join Course names
    const docs = await CourseModule.find();
    const courseIds = docs.map((d) => d.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } }).select('name pathway');
    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c._id.toString()] = { name: c.name, pathway: c.pathway };
    });

    const data = docs.map((d) => ({ courseId: d.courseId, courseName: (courseMap[d.courseId.toString()] || {}).name || '', pathway: (courseMap[d.courseId.toString()] || {}).pathway, modules: d.modules }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error fetching modules' });
  }
}

async function upsertModules(req, res) {
  try {
    const { courseId, modules } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });
    const modulesArray = Array.isArray(modules) ? modules : [];

    // --- Pre-delete check for classrooms ---
    const ModuleEntry = require('../models/module_entry');
    const Classroom = require('../models/classroom');

    // Find modules that would be removed
    const existingModuleEntries = await ModuleEntry.find({ courseId }).lean();
    const existingModuleNames = existingModuleEntries.map(m => m.name);
    const incomingModuleNames = modulesArray.map(m => typeof m === 'string' ? m : m.name);
    const modulesToRemoveNames = existingModuleNames.filter(name => !incomingModuleNames.includes(name));

    for (const moduleName of modulesToRemoveNames) {
      const classroomExists = await Classroom.findOne({ courseId, moduleName: moduleName });
      if (classroomExists) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot remove module "${moduleName}" as it is currently associated with a classroom.` 
        });
      }
    }
    // --- End pre-delete check ---

    // Update CourseModule with module names (for backward compatibility)
    const moduleNames = modulesArray.map(m => typeof m === 'string' ? m : m.name);
    const result = await CourseModule.findOneAndUpdate(
      { courseId },
      { $set: { modules: moduleNames } },
      { upsert: true, new: true }
    );

    // Upsert ModuleEntry documents with sequential information
    for (const moduleData of modulesArray) {
      try {
        const moduleName = typeof moduleData === 'string' ? moduleData : moduleData.name;
        const isSequential = typeof moduleData === 'object' ? (moduleData.isSequential || false) : false;
        const sequenceNumber = typeof moduleData === 'object' && isSequential 
          ? (moduleData.sequenceNumber || null) 
          : null;

        await ModuleEntry.updateOne(
          { courseId, name: moduleName },
          { 
            $set: { 
              courseId, 
              name: moduleName,
              isSequential,
              sequenceNumber
            } 
          },
          { upsert: true }
        );
      } catch (innerErr) {
        logger.error('Error ensuring ModuleEntry', moduleData, innerErr.message);
      }
    }

    // Remove ModuleEntry documents that are no longer present in the provided modules list
    if (modulesToRemoveNames.length > 0) {
        try {
            await ModuleEntry.deleteMany({ courseId, name: { $in: modulesToRemoveNames } });
        } catch (delErr) {
            logger.error('Error removing old ModuleEntry docs for course', courseId, delErr.message);
        }
    }

    res.status(200).json({ success: true, message: 'Modules saved', data: result });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error saving modules' });
  }
}

module.exports = {
  getAllModules,
  upsertModules
};
