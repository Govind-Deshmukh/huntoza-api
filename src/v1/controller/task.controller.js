const Task = require("../../models/Task");
const mongoose = require("mongoose");

// Helper function to check task ownership
const checkTaskOwnership = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  return task;
};

// Get all tasks with filtering and pagination
exports.getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      sort,
      page = 1,
      limit = 10,
      dueDate,
      relatedJob,
      relatedContact,
    } = req.query;

    // Build query object
    const queryObject = { user: req.user.userId };

    // Filter by status
    if (status && status !== "all") {
      queryObject.status = status;
    }

    // Filter by priority
    if (priority && priority !== "all") {
      queryObject.priority = priority;
    }

    // Filter by category
    if (category && category !== "all") {
      queryObject.category = category;
    }

    // Filter by dueDate
    if (dueDate === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      queryObject.dueDate = { $gte: today, $lt: tomorrow };
    } else if (dueDate === "upcoming") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      queryObject.dueDate = { $gte: today, $lte: nextWeek };
    } else if (dueDate === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      queryObject.dueDate = { $lt: today };
      queryObject.status = { $ne: "completed" };
    }

    // Filter by related job
    if (relatedJob) {
      queryObject.relatedJob = relatedJob;
    }

    // Filter by related contact
    if (relatedContact) {
      queryObject.relatedContact = relatedContact;
    }

    // Search by title or description
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: "i" } },
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
        case "dueDate-asc":
          sortOptions = { dueDate: 1 };
          break;
        case "dueDate-desc":
          sortOptions = { dueDate: -1 };
          break;
        case "priority-high":
          sortOptions = { priority: -1 };
          break;
        case "priority-low":
          sortOptions = { priority: 1 };
          break;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and populate related fields
    const tasks = await Task.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("relatedJob", "company position")
      .populate("relatedContact", "name email");

    // Get total count
    const totalTasks = await Task.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalTasks / limit);

    res.status(200).json({
      success: true,
      count: tasks.length,
      totalTasks,
      numOfPages,
      currentPage: parseInt(page),
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message,
    });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    // Add user ID to task data
    req.body.user = req.user.userId;

    // Create the task
    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })
      .populate("relatedJob", "company position")
      .populate("relatedContact", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve task",
      error: error.message,
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await checkTaskOwnership(req.params.id, req.user.userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Prevent changing the user field
    delete req.body.user;

    // Check if task is being marked as completed
    if (req.body.status === "completed" && task.status !== "completed") {
      req.body.completedAt = Date.now();
    } else if (req.body.status !== "completed" && task.status === "completed") {
      req.body.completedAt = null;
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("relatedJob", "company position")
      .populate("relatedContact", "name email");

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await checkTaskOwnership(req.params.id, req.user.userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

// Mark task as completed
exports.completeTask = async (req, res) => {
  try {
    const task = await checkTaskOwnership(req.params.id, req.user.userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Set status to completed and update completedAt timestamp
    task.status = "completed";
    task.completedAt = Date.now();

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task marked as completed",
      task,
    });
  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete task",
      error: error.message,
    });
  }
};
