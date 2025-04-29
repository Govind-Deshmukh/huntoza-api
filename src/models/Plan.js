const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide plan name'],
    enum: ['free', 'basic', 'premium', 'enterprise'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide plan description']
  },
  price: {
    monthly: {
      type: Number,
      required: true
    },
    yearly: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  limits: {
    jobApplications: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    contacts: {
      type: Number,
      default: -1
    },
    documents: {
      type: Number,
      default: -1
    },
    documentStorage: {
      type: Number,
      default: 0 // In MB
    },
    publicProfile: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    exportData: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
PlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Plan', PlanSchema);