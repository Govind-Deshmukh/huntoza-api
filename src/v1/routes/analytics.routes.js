const express = require("express");
const router = express.Router();
const analyticsController = require("../controller/analytics.controller");
const verifyToken = require("../../middleware/verifyToken");

// All routes are protected
router.use(verifyToken);

// Get dashboard analytics
router.get("/dashboard", analyticsController.getDashboardAnalytics);

// Get application analytics
router.get("/applications", analyticsController.getApplicationAnalytics);

// Get interview analytics
router.get("/interviews", analyticsController.getInterviewAnalytics);

// Get task analytics
router.get("/tasks", analyticsController.getTaskAnalytics);

// Get networking analytics
router.get("/networking", analyticsController.getNetworkingAnalytics);

module.exports = router;
