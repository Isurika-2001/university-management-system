const CourseModule = require('../models/module');
const Course = require('../models/course');
const logger = require('../utils/logger');

async function getAllModules(req, res) {
  try {
    const { courseId } = req.query;

    // If a specific courseId is requested, return modules array for that course
    if (courseId) {
      // Return individual ModuleEntry documents for the course (with ids, names and courseId)
      const ModuleEntry = require('../models/module_entry');
      const entries = await ModuleEntry.find({ courseId }).select('_id name courseId').lean();

      // If ModuleEntry docs exist, return them. Otherwise fall back to CourseModule (legacy list of names)
      if (entries && entries.length > 0) {
        return res.status(200).json({ success: true, data: entries });
      }

      // Fallback: check CourseModule document for this course and return module names as objects
      const cm = await CourseModule.findOne({ courseId }).lean();
      if (cm && Array.isArray(cm.modules)) {
        const fallback = cm.modules.map((name, idx) => ({ _id: null, name, courseId }));
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

    const result = await CourseModule.findOneAndUpdate(
      { courseId },
      { $set: { modules: modulesArray } },
      { upsert: true, new: true }
    );

    // Ensure ModuleEntry documents exist for each module name for the course
    const ModuleEntry = require('../models/module_entry');
    for (const mName of modulesArray) {
      try {
        await ModuleEntry.updateOne(
          { courseId, name: mName },
          { $set: { courseId, name: mName } },
          { upsert: true }
        );
      } catch (innerErr) {
        logger.error('Error ensuring ModuleEntry', mName, innerErr.message);
      }
    }

    // Remove ModuleEntry documents that are no longer present in the provided modules list
    try {
      await ModuleEntry.deleteMany({ courseId, name: { $nin: modulesArray } });
    } catch (delErr) {
      logger.error('Error removing old ModuleEntry docs for course', courseId, delErr.message);
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
