// server/models/Contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["unread", "read", "responded"],
    default: "unread",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index to sort by creation date (newest first)
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model("Contactus", contactSchema);

module.exports = Contact;
