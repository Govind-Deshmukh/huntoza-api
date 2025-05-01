const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["job", "task", "contact", "system", "payment", "other"],
    default: "other",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedItem: {
    type: {
      type: String,
      enum: ["job", "task", "contact", "payment", "document", null],
      default: null,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  actionLink: {
    type: String,
    default: null,
  },
  sendEmail: {
    type: Boolean,
    default: false,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Expire after 30 days by default
      return date;
    },
  },
});

// Create index for expiration
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create index for querying user's unread notifications
NotificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);
