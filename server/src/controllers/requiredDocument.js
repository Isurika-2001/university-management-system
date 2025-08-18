const RequiredDocument = require('../models/requiredDocument');
const ActivityLogger = require('../utils/activityLogger');

// Get all required documents with pagination and search
const getAllRequiredDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const documents = await RequiredDocument.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await RequiredDocument.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: documents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching required documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch required documents',
      error: error.message
    });
  }
};

// Get a single required document by ID
const getRequiredDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await RequiredDocument.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Required document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching required document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch required document',
      error: error.message
    });
  }
};

// Create a new required document
const createRequiredDocument = async (req, res) => {
  try {
    const documentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const document = new RequiredDocument(documentData);
    await document.save();

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: 'CREATE',
      description: 'Created required document',
      resourceType: 'RequiredDocument',
      resourceId: document._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const populatedDocument = await RequiredDocument.findById(document._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Required document created successfully',
      data: populatedDocument
    });
  } catch (error) {
    console.error('Error creating required document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create required document',
      error: error.message
    });
  }
};

// Update a required document
const updateRequiredDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const document = await RequiredDocument.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Required document not found'
      });
    }

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: 'UPDATE',
      description: 'Updated required document',
      resourceType: 'RequiredDocument',
      resourceId: document._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Required document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating required document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update required document',
      error: error.message
    });
  }
};

// Delete a required document
const deleteRequiredDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await RequiredDocument.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Required document not found'
      });
    }

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: 'DELETE',
      description: 'Deleted required document',
      resourceType: 'RequiredDocument',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Required document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting required document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete required document',
      error: error.message
    });
  }
};

// Bulk delete required documents
const bulkDeleteRequiredDocuments = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of document IDs to delete'
      });
    }

    const result = await RequiredDocument.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No documents found to delete'
      });
    }

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: 'DELETE',
      description: `Bulk deleted ${result.deletedCount} required documents`,
      resourceType: 'RequiredDocument',
      details: {
        deletedIds: ids,
        deletedCount: result.deletedCount
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `${result.deletedCount} required document(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting required documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete required documents',
      error: error.message
    });
  }
};

module.exports = {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
  bulkDeleteRequiredDocuments
};
