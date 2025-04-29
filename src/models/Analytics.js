const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  applications: {
    total: {
      type: Number,
      default: 0
    },
    statusCounts: {
      applied: { type: Number, default: 0 },
      screening: { type: Number, default: 0 },
      interview: { type: Number, default: 0 },
      offer: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      withdrawn: { type: Number, default: 0 },
      saved: { type: Number, default: 0 }
    },
    byJobType: {
      fullTime: { type: Number, default: 0 },
      partTime: { type: Number, default: 0 },
      contract: { type: Number, default: 0 },
      internship: { type: Number, default: 0 },
      remote: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    applicationsByWeek: [{
      week: String, // Format: YYYY-WW
      count: Number
    }],
    applicationsByMonth: [{
      month: String, // Format: YYYY-MM
      count: Number
    }]
  },
  interviews: {
    total: {
      type: Number,
      default: 0
    },
    byType: {
      phone: { type: Number, default: 0 },
      video: { type: Number, default: 0 },
      inPerson: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    successRate: {
      type: Number,
      default: 0 // Percentage
    },
    interviewsPerWeek: [{
      week: String, // Format: YYYY-WW
      count: Number
    }]
  },
  responseRates: {
    overall: {
      type: Number,
      default: 0 // Percentage
    },
    byJobType: {
      fullTime: { type: Number, default: 0 },
      partTime: { type: Number, default: 0 },
      contract: { type: Number, default: 0 },
      internship: { type: Number, default: 0 },
      remote: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    byCompany: [{
      company: String,
      applied: Number,
      responded: Number,
      rate: Number // Percentage
    }]
  },
  tasks: {
    total: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0 // Percentage
    },
    byCategory: {
      application: { type: Number, default: 0 },
      networking: { type: Number, default: 0 },
      interviewPrep: { type: Number, default: 0 },
      skillDevelopment: { type: Number, default: 0 },
      followUp: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  networkingStats: {
    totalContacts: {
      type: Number,
      default: 0
    },
    contactsByType: {
      recruiter: { type: Number, default: 0 },
      hiringManager: { type: Number, default: 0 },
      colleague: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      mentor: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    interactionsByMonth: [{
      month: String, // Format: YYYY-MM
      count: Number
    }]
  },
  activityTimeline: [{
    date: Date,
    events: [{
      type: {
        type: String,
        enum: ['application', 'interview', 'networking', 'task', 'offer']
      },
      count: Number
    }]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated field on save
AnalyticsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);