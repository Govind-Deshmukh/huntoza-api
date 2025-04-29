const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide contact name'],
    maxlength: 100
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  linkedIn: {
    type: String,
    default: ''
  },
  relationship: {
    type: String,
    enum: ['recruiter', 'hiring-manager', 'colleague', 'referral', 'mentor', 'other'],
    default: 'other'
  },
  relatedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  notes: {
    type: String,
    default: ''
  },
  lastContactDate: {
    type: Date,
    default: null
  },
  interactionHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['email', 'call', 'meeting', 'message', 'other'],
      default: 'other'
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  followUpDate: {
    type: Date,
    default: null
  },
  tags: [String],
  favorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);