const express = require("express");
const router = express.Router();
const taskController = require("../controller/task.controller");
const verifyToken = require("../../middleware/verifyToken");

// All routes are protected
router.use(verifyToken);

// Get all tasks with filtering and pagination
router.get("/", taskController.getTasks);

// Create a new task
router.post("/", taskController.createTask);

// Get task by ID
router.get("/:id", taskController.getTaskById);

// Update task
router.patch("/:id", taskController.updateTask);

// Delete task
router.delete("/:id", taskController.deleteTask);

// Mark task as completed
router.patch("/:id/complete", taskController.completeTask);

module.exports = router;
