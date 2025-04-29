const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Please provide company name'],
    maxlength: 100
  },
  position: {
    type: String,
    required: [true, 'Please provide job position'],
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn', 'saved'],
    default: 'applied'
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote', 'other'],
    default: 'full-time'
  },
  jobLocation: {
    type: String,
    default: 'remote'
  },
  jobDescription: {
    type: String,
    default: ''
  },
  jobUrl: {
    type: String,
    default: ''
  },
  salary: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  contactPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  documents: {
    resume: {
      type: String,
      default: ''
    },
    coverLetter: {
      type: String,
      default: ''
    },
    other: [{
      name: String,
      url: String
    }]
  },
  interviewHistory: [{
    date: Date,
    interviewType: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'other']
    },
    withPerson: String,
    notes: String,
    followUpDate: Date
  }],
  feedbackReceived: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
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
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', JobSchema);