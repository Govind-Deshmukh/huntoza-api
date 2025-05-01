const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
const verifyToken = require("../../middleware/verifyToken");

// All routes are protected
router.use(verifyToken);

// Get all notifications with filtering and pagination
router.get("/", notificationController.getNotifications);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

// Delete all read notifications
router.delete("/delete-all-read", notificationController.deleteAllRead);

module.exports = router;
