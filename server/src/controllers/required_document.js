const RequiredDocument = require("../models/required_document");
const ActivityLogger = require("../utils/activityLogger");

// Get all required documents
const getAllRequiredDocuments = async (req, res) => {
  try {
    const documents = await RequiredDocument.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error("Error fetching required documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single required document by ID
const getRequiredDocumentById = async (req, res) => {
  try {
    const document = await RequiredDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Required document not found" });
    }
    res.json(document);
  } catch (error) {
    console.error("Error fetching required document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new required document
const createRequiredDocument = async (req, res) => {
  try {
    const { name, description, type, isRequired } = req.body;

    if (!name || !description || !type) {
      return res.status(400).json({ message: "Name, description, and type are required" });
    }

    const existingDocument = await RequiredDocument.findOne({ name });
    if (existingDocument) {
      return res.status(400).json({ message: "Document with this name already exists" });
    }

    const newDocument = new RequiredDocument({
      name,
      description,
      type,
      isRequired: isRequired !== undefined ? isRequired : true,
    });

    const savedDocument = await newDocument.save();

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: "CREATE",
      description: "Created new required document",
      resourceType: "RequiredDocument",
      resourceId: savedDocument._id
    });

    res.status(201).json(savedDocument);
  } catch (error) {
    console.error("Error creating required document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a required document
const updateRequiredDocument = async (req, res) => {
  try {
    const { name, description, type, isRequired } = req.body;

    if (!name || !description || !type) {
      return res.status(400).json({ message: "Name, description, and type are required" });
    }

    const existingDocument = await RequiredDocument.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    if (existingDocument) {
      return res.status(400).json({ message: "Document with this name already exists" });
    }

    const updatedDocument = await RequiredDocument.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        type, 
        isRequired: isRequired !== undefined ? isRequired : true 
      },
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Required document not found" });
    }

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: "UPDATE",
      description: "Updated required document",
      resourceType: "RequiredDocument",
      resourceId: updatedDocument._id
    });

    res.json(updatedDocument);
  } catch (error) {
    console.error("Error updating required document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a required document
const deleteRequiredDocument = async (req, res) => {
  try {
    const deletedDocument = await RequiredDocument.findByIdAndDelete(req.params.id);
    
    if (!deletedDocument) {
      return res.status(404).json({ message: "Required document not found" });
    }

    // Log activity
    await ActivityLogger.logActivity({
      user: req.user,
      action: "DELETE",
      description: "Deleted required document",
      resourceType: "RequiredDocument",
      resourceId: deletedDocument._id
    });

    res.json({ message: "Required document deleted successfully" });
  } catch (error) {
    console.error("Error deleting required document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllRequiredDocuments,
  getRequiredDocumentById,
  createRequiredDocument,
  updateRequiredDocument,
  deleteRequiredDocument,
};
