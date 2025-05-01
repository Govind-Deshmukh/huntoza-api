const Notification = require("../../models/Notification");
const User = require("../../models/User");
const { sendMail } = require("../../middleware/mailService");

// Helper function to create a notification and optionally send an email
exports.createNotification = async ({
  userId,
  title,
  message,
  type = "other",
  priority = "medium",
  relatedItem = null,
  actionLink = null,
  sendEmail = false,
  emailTemplate = null,
  emailData = {},
}) => {
  try {
    // Create the notification
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      priority,
      relatedItem,
      actionLink,
      sendEmail,
    });

    // Send email if requested
    if (sendEmail && emailTemplate) {
      const user = await User.findById(userId);
      if (user && user.email) {
        try {
          await sendMail({
            to: user.email,
            subject: title,
            template: emailTemplate,
            data: {
              name: user.name,
              ...emailData,
              actionUrl: actionLink || "",
              currentYear: new Date().getFullYear(),
            },
          });

          // Mark email as sent
          notification.emailSent = true;
          await notification.save();
        } catch (emailError) {
          console.error("Notification email error:", emailError);
          // Continue even if email fails
        }
      }
    }

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// Get user notifications with pagination and filtering
exports.getNotifications = async (req, res) => {
  try {
    const {
      read,
      type,
      priority,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    // Build query
    const queryObject = { user: req.user.userId };

    // Filter by read status
    if (read === "true") {
      queryObject.read = true;
    } else if (read === "false") {
      queryObject.read = false;
    }

    // Filter by type
    if (type && type !== "all") {
      queryObject.type = type;
    }

    // Filter by priority
    if (priority && priority !== "all") {
      queryObject.priority = priority;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (sort === "priority") {
      // Sort by priority (high > medium > low) then by date
      sortOptions = {
        priority: -1, // -1 for priority because we want 'high' first
        createdAt: -1,
      };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const notifications = await Notification.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get counts
    const totalNotifications = await Notification.countDocuments(queryObject);
    const unreadCount = await Notification.countDocuments({
      user: req.user.userId,
      read: false,
    });
    const numOfPages = Math.ceil(totalNotifications / limit);

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
      totalNotifications,
      unreadCount,
      numOfPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the notification
    const notification = await Notification.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Mark as read
    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { user: req.user.userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result.nModified || result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Delete all read notifications
exports.deleteAllRead = async (req, res) => {
  try {
    // Delete all read notifications for the user
    const result = await Notification.deleteMany({
      user: req.user.userId,
      read: true,
    });

    res.status(200).json({
      success: true,
      message: "All read notifications deleted",
      count: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all read notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
      error: error.message,
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve unread count",
      error: error.message,
    });
  }
};
