const express = require("express");
const router = express.Router();
const documentController = require("../controller/document.controller");
const verifyToken = require("../../middleware/verifyToken");

// Public route for accessing shared documents
router.get("/public/:id", documentController.getPublicDocument);

// All other routes are protected
router.use(verifyToken);

// Get all documents with filtering and pagination
router.get("/", documentController.getDocuments);

// Upload a new document
router.post("/", documentController.uploadDocument);

// Get document by ID
router.get("/:id", documentController.getDocumentById);

// Update document details
router.patch("/:id", documentController.updateDocument);

// Delete document
router.delete("/:id", documentController.deleteDocument);

// Get default documents for each type
router.get("/defaults", documentController.getDefaultDocuments);

// Set document as default for its type
router.patch("/:id/set-default", documentController.setAsDefault);

// Get all document tags
router.get("/tags/all", documentController.getAllTags);

// Toggle document public status
router.patch("/:id/toggle-public", documentController.togglePublicStatus);

module.exports = router;
