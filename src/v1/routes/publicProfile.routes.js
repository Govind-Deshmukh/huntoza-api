const express = require("express");
const router = express.Router();
const publicProfileController = require("../controller/publicProfile.controller");
const verifyToken = require("../../middleware/verifyToken");

// Public route - accessible without authentication
router.get("/view/:profileId", publicProfileController.getPublicProfileById);

// All other routes are protected
router.use(verifyToken);

// Get user's own profile
router.get("/", publicProfileController.getUserProfile);

// Create or update profile
router.post("/", publicProfileController.createOrUpdateProfile);

// Toggle profile active status
router.patch("/toggle-status", publicProfileController.toggleProfileStatus);

// Update profile visibility
router.patch("/visibility", publicProfileController.updateProfileVisibility);

// Delete profile
router.delete("/", publicProfileController.deleteProfile);

// Get profile metrics
router.get("/metrics", publicProfileController.getProfileMetrics);

module.exports = router;
