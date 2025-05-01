const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please provide document name"],
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ["resume", "cover-letter", "certificate", "portfolio", "other"],
    default: "other",
  },
  url: {
    type: String,
    required: [true, "Document URL is required"],
  },
  fileSize: {
    type: Number,
    default: 0, // Size in bytes
  },
  fileType: {
    type: String,
    default: "", // MIME type
  },
  tags: [String],
  isDefault: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
  version: {
    type: Number,
    default: 1,
  },
  relatedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
DocumentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one default document per type
DocumentSchema.pre("save", async function (next) {
  if (
    this.isDefault &&
    this.isModified("isDefault") &&
    this.isDefault === true
  ) {
    // Make sure only one document is set as default for this user and type
    await this.constructor.updateMany(
      {
        user: this.user,
        type: this.type,
        _id: { $ne: this._id },
      },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model("Document", DocumentSchema);
