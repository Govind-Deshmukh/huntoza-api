const PublicProfile = require("../../models/PublicProfile");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Helper function to check profile ownership
const checkProfileOwnership = async (profileId, userId) => {
  const profile = await PublicProfile.findOne({
    _id: profileId,
    user: userId,
  });
  return profile;
};

// Get user's public profile
exports.getUserProfile = async (req, res) => {
  try {
    // Find profile by user ID
    const profile = await PublicProfile.findOne({ user: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create a profile first.",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

// Create or update public profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    // Find existing profile
    let profile = await PublicProfile.findOne({ user: req.user.userId });

    // If profile exists, update it
    if (profile) {
      // Prevent changing user field
      delete req.body.user;
      delete req.body.profileId; // Don't allow changing profileId

      profile = await PublicProfile.findByIdAndUpdate(profile._id, req.body, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    }

    // Create new profile
    req.body.user = req.user.userId;
    profile = await PublicProfile.create(req.body);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Create/update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create/update profile",
      error: error.message,
    });
  }
};

// Get public profile by profileId (public route)
exports.getPublicProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;

    // Find profile by profileId (string identifier, not ObjectId)
    const profile = await PublicProfile.findOne({
      profileId: profileId,
      isActive: true,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found or inactive",
      });
    }

    // For private or link-only profiles, check access
    if (profile.visibility === "private") {
      return res.status(403).json({
        success: false,
        message: "This profile is private",
      });
    }

    if (profile.visibility === "link-only") {
      // Here you might implement additional checks for link-only profiles
      // like checking if the request has a valid access token
    }

    // Increment view count
    profile.metrics.views += 1;
    profile.metrics.lastViewed = new Date();
    await profile.save();

    // Return profile data
    res.status(200).json({
      success: true,
      profile: {
        headline: profile.headline,
        about: profile.about,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
        certifications: profile.certifications,
        resume: profile.resume,
        portfolioLinks: profile.portfolioLinks,
        socialLinks: profile.socialLinks,
        jobPreferences: profile.jobPreferences,
        customization: profile.customization,
      },
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

// Toggle profile active status
exports.toggleProfileStatus = async (req, res) => {
  try {
    // Find profile
    const profile = await PublicProfile.findOne({ user: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Toggle active status
    profile.isActive = !profile.isActive;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Profile is now ${profile.isActive ? "active" : "inactive"}`,
      profile,
    });
  } catch (error) {
    console.error("Toggle profile status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile status",
      error: error.message,
    });
  }
};

// Change profile visibility
exports.updateProfileVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;

    if (
      !visibility ||
      !["public", "private", "link-only"].includes(visibility)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility option",
      });
    }

    // Find profile
    const profile = await PublicProfile.findOne({ user: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if user's plan allows public profile
    if (visibility === "public") {
      const user = await User.findById(req.user.userId).populate("currentPlan");

      if (!user.currentPlan.limits.publicProfile) {
        return res.status(403).json({
          success: false,
          message:
            "Your current plan does not support public profiles. Please upgrade to make your profile public.",
        });
      }
    }

    // Update visibility
    profile.visibility = visibility;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Profile visibility updated to ${visibility}`,
      profile,
    });
  } catch (error) {
    console.error("Update profile visibility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile visibility",
      error: error.message,
    });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    // Find and delete profile
    const profile = await PublicProfile.findOneAndDelete({
      user: req.user.userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
      error: error.message,
    });
  }
};

// Get profile metrics
exports.getProfileMetrics = async (req, res) => {
  try {
    // Find profile
    const profile = await PublicProfile.findOne({ user: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if user's plan allows advanced analytics
    const user = await User.findById(req.user.userId).populate("currentPlan");

    const metrics = {
      views: profile.metrics.views,
      lastViewed: profile.metrics.lastViewed,
    };

    // Add more detailed metrics for premium users
    if (user.currentPlan.limits.advancedAnalytics) {
      metrics.uniqueVisitors = profile.metrics.uniqueVisitors;
      // Here you would add more detailed analytics in the future
    }

    res.status(200).json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Get profile metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile metrics",
      error: error.message,
    });
  }
};
