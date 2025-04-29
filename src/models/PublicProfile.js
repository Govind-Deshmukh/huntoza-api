const mongoose = require('mongoose');

const PublicProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileId: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  headline: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  skills: [String],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    url: String,
    image: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String
  }],
  resume: {
    type: String,
    default: ''
  },
  portfolioLinks: [{
    name: String,
    url: String
  }],
  socialLinks: {
    linkedin: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    }
  },
  jobPreferences: {
    title: String,
    types: [String], // ['full-time', 'part-time', 'contract', 'internship', 'remote']
    locations: [String],
    remote: Boolean,
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    }
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'link-only'],
    default: 'public'
  },
  customization: {
    theme: {
      type: String,
      default: 'default'
    },
    layout: {
      type: String,
      default: 'standard'
    },
    colors: {
      primary: String,
      secondary: String,
      accent: String
    }
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    lastViewed: Date
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
PublicProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate a unique profileId if not provided
PublicProfileSchema.pre('save', async function(next) {
  if (!this.profileId) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    if (user) {
      // Create a profile ID based on user's name (lowercase, no spaces) and a random string
      const namePart = user.name.toLowerCase().replace(/\s+/g, '');
      const randomPart = Math.random().toString(36).substring(2, 8);
      this.profileId = `${namePart}-${randomPart}`;
    }
  }
  next();
});

module.exports = mongoose.model('PublicProfile', PublicProfileSchema);