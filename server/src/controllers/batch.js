const Batch = require("../models/batch");

// Get all batches with search, filter, pagination
async function getAllBatches(req, res) {
  try {
    const { search = '', courseId, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    const total = await Batch.countDocuments(filter);

    // Build sort object
    const sortObj = {};
    const sortOrderNum = sortOrder === 'desc' ? -1 : 1;
    
    // Map frontend sort fields to database fields
    const sortFieldMap = {
      'name': 'name',
      'courseName': 'courseId',
      'orientationDate': 'orientationDate',
      'startDate': 'startDate',
      'registrationDeadline': 'registrationDeadline'
    };

    const sortField = sortFieldMap[sortBy] || 'name';
    sortObj[sortField] = sortOrderNum;
    
    // Debug logging
    console.log('Batch sorting debug:', {
      sortBy,
      sortOrder,
      sortField,
      sortObj,
      availableFields: Object.keys(sortFieldMap)
    });

    // For course name sorting, we need to use aggregation to sort by populated field
    if (sortBy === 'courseName') {
      const aggregationPipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course'
          }
        },
        { $unwind: '$course' },
        { $sort: { 'course.name': sortOrderNum } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 1,
            name: 1,
            courseId: '$course._id',
            courseName: '$course.name',
            orientationDate: 1,
            startDate: 1,
            registrationDeadline: 1
          }
        }
      ];

      const batches = await Batch.aggregate(aggregationPipeline);
      
      res.status(200).json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        data: batches,
      });
    } else if (sortBy === 'name') {
      // For batch name sorting, treat as numbers (e.g., "2024.1", "2024.2")
      const aggregationPipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course'
          }
        },
        { $unwind: '$course' },
        {
          $addFields: {
            nameParts: { $split: ['$name', '.'] },
            yearPart: { $toInt: { $arrayElemAt: [{ $split: ['$name', '.'] }, 0] } },
            numberPart: { $toInt: { $arrayElemAt: [{ $split: ['$name', '.'] }, 1] } }
          }
        },
        { $sort: { yearPart: sortOrderNum, numberPart: sortOrderNum } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 1,
            name: 1,
            courseId: '$course._id',
            courseName: '$course.name',
            orientationDate: 1,
            startDate: 1,
            registrationDeadline: 1
          }
        }
      ];

      const batches = await Batch.aggregate(aggregationPipeline);
      
      res.status(200).json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        data: batches,
      });
    } else {
      // For other sorting (date fields), use regular find with populate
      const batches = await Batch.find(filter)
        .populate('courseId', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

      const formattedBatches = batches.map(batch => ({
        _id: batch._id,
        name: batch.name,
        courseId: batch.courseId?._id || null,
        courseName: batch.courseId?.name || null,
        orientationDate: batch.orientationDate,
        startDate: batch.startDate,
        registrationDeadline: batch.registrationDeadline
      }));

            res.status(200).json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        data: formattedBatches,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Get batches by courseId
async function getBatchesByCourseId(req, res) {
  const { courseId } = req.params;

  try {
    const batches = await Batch.find({ courseId }).populate('courseId', 'name');

    const formattedBatches = batches.map(batch => ({
      _id: batch._id,
      name: batch.name,
      courseId: batch.courseId?._id || null,
      courseName: batch.courseId?.name || null,
      orientationDate: batch.orientationDate,
      startDate: batch.startDate,
      registrationDeadline: batch.registrationDeadline
    }));

    res.status(200).json(formattedBatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Create new batch
async function createBatch(req, res) {
  const { courseId, year, number, orientationDate, startDate, registrationDeadline } = req.body;

  const name = `${year}.${number}`;

  try {
    if (await checkDuplicateBatch(courseId, name)) {
      return res.status(403).json({
        success: false,
        message: "Batch name already exists for this course",
      });
    }

    const batch = new Batch({
      courseId,
      name,
      orientationDate,
      startDate,
      registrationDeadline
    });

    const newBatch = await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: newBatch,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Batch name already exists (duplicate key error)",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error creating batch",
        error: error.message,
      });
    }
  }
}

// Get batch by ID
async function getBatchById(req, res) {
  const { id } = req.params;

  try {
    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch retrieved successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Error retrieving batch:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving batch",
      error: error.message,
    });
  }
}

// Check for duplicate batch
async function checkDuplicateBatch(courseId, name) {
  const batch = await Batch.findOne({ courseId, name });
  return !!batch;
}

// Delete batch
async function deleteBatch(req, res) {
  const { id } = req.params;

  try {
    const deletedBatch = await Batch.findByIdAndDelete(id);

    if (!deletedBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
      data: deletedBatch,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting batch",
      error: error.message,
    });
  }
}

// Update batch
async function updateBatch(req, res) {
  const { id } = req.params;
  const { courseId, year, number, orientationDate, startDate, registrationDeadline } = req.body;

  const name = `${year}.${number}`;

  try {
    const existingBatch = await Batch.findById(id);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const duplicate = await Batch.findOne({
      courseId,
      name,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(403).json({
        success: false,
        message: "Batch name already exists for this course",
      });
    }

    existingBatch.courseId = courseId;
    existingBatch.name = name;
    existingBatch.orientationDate = orientationDate;
    existingBatch.startDate = startDate;
    existingBatch.registrationDeadline = registrationDeadline;

    const updatedBatch = await existingBatch.save();

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    res.status(500).json({
      success: false,
      message: "Error updating batch",
      error: error.message,
    });
  }
}

module.exports = {
  getAllBatches,
  createBatch,
  getBatchesByCourseId,
  deleteBatch,
  getBatchById,
  updateBatch
};
