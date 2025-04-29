const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");
const verifyToken = require("../../middleware/verifyToken");

// All routes are protected
router.use(verifyToken);

// Get all contacts with filtering and pagination
router.get("/", contactController.getContacts);

// Create a new contact
router.post("/", contactController.createContact);

// Get contact by ID
router.get("/:id", contactController.getContactById);

// Update contact
router.patch("/:id", contactController.updateContact);

// Delete contact
router.delete("/:id", contactController.deleteContact);

// Add interaction to contact
router.post("/:id/interactions", contactController.addInteraction);

// Update interaction
router.patch(
  "/:id/interactions/:interactionId",
  contactController.updateInteraction
);

// Delete interaction
router.delete(
  "/:id/interactions/:interactionId",
  contactController.deleteInteraction
);

// Toggle favorite status
router.patch("/:id/favorite", contactController.toggleFavorite);

module.exports = router;
