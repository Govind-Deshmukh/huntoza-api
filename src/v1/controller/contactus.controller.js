const axios = require("axios");

// server/controllers/contactController.js
const Contactus = require("../../models/ContactUs");

// Helper function to verify reCAPTCHA token
const verifyCaptcha = async (token) => {
  try {
    const formData = new URLSearchParams();
    formData.append("secret", process.env.RECAPTCHA_SECRET_KEY);
    formData.append("response", token);

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("reCAPTCHA verification response:", response.data);
    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body;

    // Validate request
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, subject, and message",
      });
    }

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "Please complete the reCAPTCHA verification",
      });
    }

    // Verify the reCAPTCHA token
    const isValidCaptcha = await verifyCaptcha(recaptchaToken);

    if (!isValidCaptcha) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    // Create new contact inquiry
    const contact = await Contactus.create({
      name,
      email,
      subject,
      message,
    });

    // Note: Email functionality is commented out since it's not available yet
    /*
    // This code will be implemented when email service is set up
    try {
      // Send notification email to admin
      // Send confirmation email to user
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
    }
    */

    res.status(201).json({
      success: true,
      data: contact,
      message: "Your message has been received. We will contact you soon.",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    res.status(500).json({
      success: false,
      message:
        "There was an error processing your request. Please try again later.",
    });
  }
};

// @desc    Get all contact form submissions
// @route   GET /api/contact
// @access  Private (Admin only)
exports.getContactSubmissions = async (req, res) => {
  try {
    // Default pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filter options
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get contact submissions with pagination
    const contacts = await Contactus.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalContacts = await Contactus.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: contacts.length,
      totalPages: Math.ceil(totalContacts / limit),
      currentPage: page,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contact submissions",
    });
  }
};

// @desc    Get a single contact submission
// @route   GET /api/contact/:id
// @access  Private (Admin only)
exports.getContactSubmission = async (req, res) => {
  try {
    const contact = await Contactus.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact submission:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contact submission",
    });
  }
};

// @desc    Update contact submission status
// @route   PATCH /api/contact/:id
// @access  Private (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !["unread", "read", "responded"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status: unread, read, or responded",
      });
    }

    const contact = await Contactus.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating contact status",
    });
  }
};

// @desc    Delete a contact submission
// @route   DELETE /api/contact/:id
// @access  Private (Admin only)
exports.deleteContactSubmission = async (req, res) => {
  try {
    const contact = await Contactus.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact submission successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting contact submission",
    });
  }
};
