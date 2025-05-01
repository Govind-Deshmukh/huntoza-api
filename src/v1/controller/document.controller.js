const Document = require("../../models/Document");
const User = require("../../models/User");
const fs = require("fs");
const path = require("path");
const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);

// Helper function to check document ownership
const checkDocumentOwnership = async (documentId, userId) => {
  const document = await Document.findOne({ _id: documentId, user: userId });
  return document;
};

// Get all documents with filtering and pagination
exports.getDocuments = async (req, res) => {
  try {
    const { type, search, sort, page = 1, limit = 10, tag } = req.query;

    // Build query object
    const queryObject = { user: req.user.userId };

    // Filter by type
    if (type && type !== "all") {
      queryObject.type = type;
    }

    // Filter by tag
    if (tag) {
      queryObject.tags = tag;
    }

    // Search by name or description
    if (search) {
      queryObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort) {
      switch (sort) {
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        case "a-z":
          sortOptions = { name: 1 };
          break;
        case "z-a":
          sortOptions = { name: -1 };
          break;
        case "size-asc":
          sortOptions = { fileSize: 1 };
          break;
        case "size-desc":
          sortOptions = { fileSize: -1 };
          break;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const documents = await Document.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("relatedJobs", "company position");

    // Get total count
    const totalDocuments = await Document.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalDocuments / limit);

    // Get document storage usage
    const totalStorageUsed = await Document.aggregate([
      { $match: { user: req.user.userId } },
      { $group: { _id: null, total: { $sum: "$fileSize" } } },
    ]);

    const storageUsedBytes =
      totalStorageUsed.length > 0 ? totalStorageUsed[0].total : 0;
    const storageUsedMB =
      Math.round((storageUsedBytes / (1024 * 1024)) * 100) / 100;

    res.status(200).json({
      success: true,
      count: documents.length,
      totalDocuments,
      numOfPages,
      currentPage: parseInt(page),
      documents,
      storage: {
        used: storageUsedMB, // MB
        usedBytes: storageUsedBytes, // Bytes
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
      error: error.message,
    });
  }
};

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    // Check if user is at document limit
    const user = await User.findById(req.user.userId).populate("currentPlan");

    // Count user's current documents
    const currentDocumentCount = await Document.countDocuments({
      user: req.user.userId,
    });

    // Check if user has reached their plan's limit
    if (
      user.currentPlan.limits.documents !== -1 &&
      currentDocumentCount >= user.currentPlan.limits.documents
    ) {
      return res.status(403).json({
        success: false,
        message: `You have reached your plan's limit of ${user.currentPlan.limits.documents} documents. Please upgrade your plan to add more.`,
      });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    const file = req.files.document;
    const { type, name, description, tags, isDefault = false } = req.body;

    // Check file size against plan limits
    const fileSizeInMB = file.size / (1024 * 1024);
    const storageLimit = user.currentPlan.limits.documentStorage;

    if (storageLimit !== -1 && fileSizeInMB > storageLimit) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds your plan's storage limit of ${storageLimit}MB per file`,
      });
    }

    // Check total storage usage
    const totalStorageUsed = await Document.aggregate([
      { $match: { user: req.user.userId } },
      { $group: { _id: null, total: { $sum: "$fileSize" } } },
    ]);

    const currentStorageUsed =
      totalStorageUsed.length > 0 ? totalStorageUsed[0].total : 0;
    const totalStorageAfterUpload = currentStorageUsed + file.size;
    const totalStorageAfterUploadMB = totalStorageAfterUpload / (1024 * 1024);

    if (storageLimit !== -1 && totalStorageAfterUploadMB > storageLimit) {
      return res.status(400).json({
        success: false,
        message: `This upload would exceed your storage limit of ${storageLimit}MB. Current usage: ${
          Math.round((currentStorageUsed / (1024 * 1024)) * 100) / 100
        }MB`,
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      __dirname,
      "../../../uploads",
      req.user.userId,
      "documents"
    );
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(uploadsDir, fileName);

    // Move the file
    await file.mv(filepath);

    // Save file info to database
    const fileUrl = `/uploads/${req.user.userId}/documents/${fileName}`;

    // Parse tags if they're sent as a string
    let tagArray = [];
    if (tags) {
      tagArray = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    // Create document record
    const document = await Document.create({
      user: req.user.userId,
      name: name || file.name,
      type: type || "other",
      url: fileUrl,
      fileSize: file.size,
      fileType: file.mimetype,
      tags: tagArray,
      isDefault: isDefault === "true",
      description: description || "",
    });

    res.status(201).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await checkDocumentOwnership(
      req.params.id,
      req.user.userId
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get document by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document",
      error: error.message,
    });
  }
};

// Update document details
exports.updateDocument = async (req, res) => {
  try {
    const document = await checkDocumentOwnership(
      req.params.id,
      req.user.userId
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Fields that can be updated
    const { name, type, description, tags, isDefault } = req.body;

    // Update fields if provided
    if (name) document.name = name;
    if (type) document.type = type;
    if (description !== undefined) document.description = description;
    if (tags) {
      document.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }
    if (isDefault !== undefined)
      document.isDefault = isDefault === true || isDefault === "true";

    // Increment version
    document.version += 1;

    await document.save();

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Update document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: error.message,
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await checkDocumentOwnership(
      req.params.id,
      req.user.userId
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Get the file path
    const filePath = path.join(__dirname, "../../../", document.url);

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);

    // Delete file from storage if it exists
    try {
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
    } catch (fileError) {
      console.error("File deletion error:", fileError);
      // Continue even if file deletion fails
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

// Get default documents for each type
exports.getDefaultDocuments = async (req, res) => {
  try {
    // Find all default documents for the user
    const defaultDocuments = await Document.find({
      user: req.user.userId,
      isDefault: true,
    });

    // Organize by type
    const organizedDefaults = {
      resume: defaultDocuments.find((doc) => doc.type === "resume") || null,
      "cover-letter":
        defaultDocuments.find((doc) => doc.type === "cover-letter") || null,
      certificate:
        defaultDocuments.find((doc) => doc.type === "certificate") || null,
      portfolio:
        defaultDocuments.find((doc) => doc.type === "portfolio") || null,
      other: defaultDocuments.find((doc) => doc.type === "other") || null,
    };

    res.status(200).json({
      success: true,
      defaultDocuments: organizedDefaults,
    });
  } catch (error) {
    console.error("Get default documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve default documents",
      error: error.message,
    });
  }
};

// Set document as default for its type
exports.setAsDefault = async (req, res) => {
  try {
    const document = await checkDocumentOwnership(
      req.params.id,
      req.user.userId
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Reset all other documents of the same type
    await Document.updateMany(
      {
        user: req.user.userId,
        type: document.type,
        _id: { $ne: document._id },
      },
      { isDefault: false }
    );

    // Set this document as default
    document.isDefault = true;
    await document.save();

    res.status(200).json({
      success: true,
      message: `Document set as default ${document.type}`,
      document,
    });
  } catch (error) {
    console.error("Set as default error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set document as default",
      error: error.message,
    });
  }
};

// Get all document tags
exports.getAllTags = async (req, res) => {
  try {
    // Get all unique tags across user's documents
    const documents = await Document.find({ user: req.user.userId });

    // Extract and flatten all tags
    const allTags = documents.reduce((tags, doc) => {
      return tags.concat(doc.tags);
    }, []);

    // Get unique tags
    const uniqueTags = [...new Set(allTags)].filter((tag) => tag); // Remove empty tags

    res.status(200).json({
      success: true,
      tags: uniqueTags,
    });
  } catch (error) {
    console.error("Get all tags error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document tags",
      error: error.message,
    });
  }
};

// Get public document for sharing (if document is public)
exports.getPublicDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Find document by ID and check if it's public
    const document = await Document.findOne({
      _id: id,
      isPublic: true,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or not publicly available",
      });
    }

    // Return minimal document info
    res.status(200).json({
      success: true,
      document: {
        name: document.name,
        type: document.type,
        description: document.description,
        url: document.url,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Get public document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document",
      error: error.message,
    });
  }
};

// Toggle document public status
exports.togglePublicStatus = async (req, res) => {
  try {
    const document = await checkDocumentOwnership(
      req.params.id,
      req.user.userId
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user's plan allows public documents
    if (!document.isPublic) {
      const user = await User.findById(req.user.userId).populate("currentPlan");

      if (!user.currentPlan.limits.publicProfile) {
        return res.status(403).json({
          success: false,
          message:
            "Your current plan does not support public documents. Please upgrade to make documents public.",
        });
      }
    }

    // Toggle public status
    document.isPublic = !document.isPublic;
    await document.save();

    res.status(200).json({
      success: true,
      message: `Document is now ${document.isPublic ? "public" : "private"}`,
      document,
    });
  } catch (error) {
    console.error("Toggle public status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update document status",
      error: error.message,
    });
  }
};
