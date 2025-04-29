const Job = require("../../models/Job");
const User = require("../../models/User");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Helper function to check job ownership
const checkJobOwnership = async (jobId, userId) => {
  const job = await Job.findOne({ _id: jobId, user: userId });
  return job;
};

// Get all jobs with filtering and pagination
exports.getJobs = async (req, res) => {
  try {
    const {
      status,
      jobType,
      search,
      sort,
      page = 1,
      limit = 10,
      favorite,
    } = req.query;

    // Build query object
    const queryObject = { user: req.user.userId };

    // Filter by status
    if (status && status !== "all") {
      queryObject.status = status;
    }

    // Filter by job type
    if (jobType && jobType !== "all") {
      queryObject.jobType = jobType;
    }

    // Filter by favorite
    if (favorite === "true") {
      queryObject.favorite = true;
    }

    // Search by company or position
    if (search) {
      queryObject.$or = [
        { company: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
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
          sortOptions = { company: 1 };
          break;
        case "z-a":
          sortOptions = { company: -1 };
          break;
        case "priority-high":
          sortOptions = { priority: -1 };
          break;
        case "application-date":
          sortOptions = { applicationDate: -1 };
          break;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const jobs = await Job.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      numOfPages,
      currentPage: page,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve jobs",
      error: error.message,
    });
  }
};

// Create a new job application
exports.createJob = async (req, res) => {
  try {
    // Check if user is at application limit
    const user = await User.findById(req.user.userId).populate("currentPlan");

    // Count user's current applications
    const currentJobCount = await Job.countDocuments({
      user: req.user.userId,
      status: { $ne: "saved" }, // Don't count saved (draft) jobs
    });

    // Check if user has reached their plan's limit
    if (
      user.currentPlan.limits.jobApplications !== -1 &&
      currentJobCount >= user.currentPlan.limits.jobApplications
    ) {
      return res.status(403).json({
        success: false,
        message: `You have reached your plan's limit of ${user.currentPlan.limits.jobApplications} job applications. Please upgrade your plan to add more.`,
      });
    }

    // Add user ID to job data
    req.body.user = req.user.userId;

    // Create the job
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job application",
      error: error.message,
    });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job",
      error: error.message,
    });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Prevent changing the user field
    delete req.body.user;

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

// Add interview to job
exports.addInterview = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Add interview to the job's interviewHistory array
    job.interviewHistory.push(req.body);

    // If not already in interview status, update job status
    if (job.status !== "interview" && job.status !== "offer") {
      job.status = "interview";
    }

    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Add interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add interview",
      error: error.message,
    });
  }
};

// Update interview
exports.updateInterview = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Find the interview to update
    const interviewIndex = job.interviewHistory.findIndex(
      (interview) => interview._id.toString() === req.params.interviewId
    );

    if (interviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Update the interview fields
    Object.keys(req.body).forEach((key) => {
      job.interviewHistory[interviewIndex][key] = req.body[key];
    });

    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Update interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview",
      error: error.message,
    });
  }
};

// Delete interview
exports.deleteInterview = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Remove the interview from the array
    job.interviewHistory = job.interviewHistory.filter(
      (interview) => interview._id.toString() !== req.params.interviewId
    );

    // If no interviews left and status is 'interview', revert to 'applied'
    if (job.interviewHistory.length === 0 && job.status === "interview") {
      job.status = "applied";
    }

    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Delete interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete interview",
      error: error.message,
    });
  }
};

// Upload document for job
exports.uploadDocument = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user has reached document storage limit
    const user = await User.findById(req.user.userId).populate("currentPlan");
    const storageLimit = user.currentPlan.limits.documentStorage;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    const file = req.files.document;
    const documentType = req.body.type; // resume, coverLetter, or other

    // Check file size (in MB)
    const fileSizeInMB = file.size / (1024 * 1024);

    if (storageLimit !== -1 && fileSizeInMB > storageLimit) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds your plan's storage limit of ${storageLimit}MB per file`,
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      __dirname,
      "../../../uploads",
      req.user.userId
    );
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadsDir, filename);

    // Move the file
    await file.mv(filepath);

    // Save file info to job document
    const fileUrl = `/uploads/${req.user.userId}/${filename}`;

    if (documentType === "resume") {
      job.documents.resume = fileUrl;
    } else if (documentType === "coverLetter") {
      job.documents.coverLetter = fileUrl;
    } else {
      // Other document type
      job.documents.other.push({
        name: req.body.name || file.name,
        url: fileUrl,
      });
    }

    await job.save();

    res.status(200).json({
      success: true,
      job,
      document: {
        name: file.name,
        url: fileUrl,
        type: documentType,
      },
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

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const job = await checkJobOwnership(req.params.id, req.user.userId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const { documentId } = req.params;
    const { type } = req.query; // resume, coverLetter, or other

    let fileUrl;

    if (type === "resume") {
      fileUrl = job.documents.resume;
      job.documents.resume = "";
    } else if (type === "coverLetter") {
      fileUrl = job.documents.coverLetter;
      job.documents.coverLetter = "";
    } else if (type === "other") {
      // Find the other document
      const docIndex = job.documents.other.findIndex(
        (doc) => doc._id.toString() === documentId
      );

      if (docIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      fileUrl = job.documents.other[docIndex].url;

      // Remove the document from the array
      job.documents.other.splice(docIndex, 1);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid document type",
      });
    }

    // Save job changes
    await job.save();

    // Delete the file from storage if it exists
    if (fileUrl) {
      const filePath = path.join(__dirname, "../../../", fileUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      job,
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
