const User = require("../../models/User");
const Plan = require("../../models/Plan");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendMail } = require("../../middleware/mailService");

// Define token lifetime constants
const ACCESS_TOKEN_LIFETIME = process.env.JWT_LIFETIME || "15m"; // Shorter for security
const REFRESH_TOKEN_LIFETIME = process.env.REFRESH_TOKEN_LIFETIME || "7d";

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only HTTPS in production
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 minutes for access token
};

/**
 * Generate a new refresh token for a user
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Generated refresh token
 */
const generateRefreshToken = async (userId) => {
  // Generate a random token
  const refreshToken = crypto.randomBytes(40).toString("hex");

  // Save the token to the user document
  await User.findByIdAndUpdate(userId, { refreshToken });

  return refreshToken;
};

// Register new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Find the free plan
    const freePlan = await Plan.findOne({ name: "free" });
    if (!freePlan) {
      return res.status(500).json({
        success: false,
        message: "System error: Free plan not available",
      });
    }

    // Create the user with free plan
    const user = await User.create({
      name,
      email,
      password,
      currentPlan: freePlan._id,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user._id);

    // Set HTTP-only cookies
    res.cookie("accessToken", token, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    // Remove password from response
    user.password = undefined;

    // Send welcome email
    try {
      await sendMail({
        to: user.email,
        subject: "Welcome to Job Hunt Tracker",
        template: "welcome",
        data: {
          name: user.name,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
          planName: freePlan.name,
          currentYear: new Date().getFullYear(),
        },
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with the response even if email fails
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      // Don't send tokens in response body anymore
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user._id);

    // Set HTTP-only cookies
    res.cookie("accessToken", token, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      // Don't send tokens in response body anymore
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });

    if (!user) {
      // Clear invalid refresh token cookie
      res.clearCookie("refreshToken");
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });

    // Generate new refresh token (token rotation for better security)
    const newRefreshToken = await generateRefreshToken(user._id);

    // Set new HTTP-only cookies
    res.cookie("accessToken", token, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password -refreshToken")
      .populate("currentPlan", "name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
      error: error.message,
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Clear refresh token in database
    await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });

    // Clear HTTP-only cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });

    const refreshToken = await generateRefreshToken(user._id);

    // Set new HTTP-only cookies
    res.cookie("accessToken", token, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.userId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another account",
        });
      }
    }

    // Update fields
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;

    // Update user
    const user = await User.findByIdAndUpdate(req.user.userId, updatedFields, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Define the secret key to use for hashing
    const secret =
      process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "oV2sB0LuXgP";

    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHmac("sha256", secret)
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendMail({
        to: user.email,
        subject: "Password Reset - Job Hunt Tracker",
        template: "resetPassword",
        data: {
          name: user.name,
          resetUrl,
          currentYear: new Date().getFullYear(),
        },
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (emailError) {
      console.error("Reset email error:", emailError);

      // Reset the reset token and expiry
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Could not send reset email",
        error: "Email sending failed",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
};

// Check if reset token is valid
exports.checkResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL
    const secret =
      process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "oV2sB0LuXgP";

    const resetPasswordToken = crypto
      .createHmac("sha256", secret)
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Check reset token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate token",
      error: error.message,
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    // Get token from params
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from URL
    const secret =
      process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || "oV2sB0LuXgP";

    const resetPasswordToken = crypto
      .createHmac("sha256", secret)
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new JWT token
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME,
    });

    // Generate refresh token
    const refreshToken = await generateRefreshToken(user._id);

    // Set HTTP-only cookies
    res.cookie("accessToken", jwtToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
