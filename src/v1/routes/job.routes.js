const express = require("express");
const router = express.Router();
const jobController = require("../controller/job.controller");
const verifyToken = require("../../middleware/verifyToken");

// All routes are protected
router.use(verifyToken);

// Get all user jobs with filtering and pagination
router.get("/", jobController.getJobs);

// Create a new job application
router.post("/", jobController.createJob);

// Get job by ID
router.get("/:id", jobController.getJobById);

// Update job
router.patch("/:id", jobController.updateJob);

// Delete job
router.delete("/:id", jobController.deleteJob);

// Add interview to job
router.post("/:id/interviews", jobController.addInterview);

// Update interview
router.patch("/:id/interviews/:interviewId", jobController.updateInterview);

// Delete interview
router.delete("/:id/interviews/:interviewId", jobController.deleteInterview);

// Upload document for job (resume, cover letter, etc.)
router.post("/:id/documents", jobController.uploadDocument);

// Delete document
router.delete("/:id/documents/:documentId", jobController.deleteDocument);

module.exports = router;
