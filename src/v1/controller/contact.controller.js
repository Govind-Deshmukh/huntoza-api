const Contact = require("../../models/Contact");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Helper function to check contact ownership
const checkContactOwnership = async (contactId, userId) => {
  const contact = await Contact.findOne({ _id: contactId, user: userId });
  return contact;
};

// Get all contacts with filtering and pagination
exports.getContacts = async (req, res) => {
  try {
    const {
      relationship,
      search,
      sort,
      page = 1,
      limit = 10,
      favorite,
      tag,
    } = req.query;

    // Build query object
    const queryObject = { user: req.user.userId };

    // Filter by relationship
    if (relationship && relationship !== "all") {
      queryObject.relationship = relationship;
    }

    // Filter by favorite
    if (favorite === "true") {
      queryObject.favorite = true;
    }

    // Filter by tag
    if (tag) {
      queryObject.tags = tag;
    }

    // Search by name, email, company
    if (search) {
      queryObject.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sort) {
      switch (sort) {
        case "oldest":
          sortOptions = { createdAt: 1 };
          break;
        case "a-z":
          sortOptions = { name: 1 };
          break;
        case "z-a":
          sortOptions = { name: -1 };
          break;
        case "last-contact":
          sortOptions = { lastContactDate: -1 };
          break;
        case "company":
          sortOptions = { company: 1 };
          break;
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const contacts = await Contact.find(queryObject)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("relatedJobs", "company position");

    // Get total count
    const totalContacts = await Contact.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalContacts / limit);

    res.status(200).json({
      success: true,
      count: contacts.length,
      totalContacts,
      numOfPages,
      currentPage: parseInt(page),
      contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contacts",
      error: error.message,
    });
  }
};

// Create a new contact
exports.createContact = async (req, res) => {
  try {
    // Check if user is at contacts limit
    const user = await User.findById(req.user.userId).populate("currentPlan");

    // Count user's current contacts
    const currentContactCount = await Contact.countDocuments({
      user: req.user.userId,
    });

    // Check if user has reached their plan's limit
    if (
      user.currentPlan.limits.contacts !== -1 &&
      currentContactCount >= user.currentPlan.limits.contacts
    ) {
      return res.status(403).json({
        success: false,
        message: `You have reached your plan's limit of ${user.currentPlan.limits.contacts} contacts. Please upgrade your plan to add more.`,
      });
    }

    // Add user ID to contact data
    req.body.user = req.user.userId;

    // Create the contact
    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create contact",
      error: error.message,
    });
  }
};

// Get contact by ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate("relatedJobs", "company position");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get contact by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve contact",
      error: error.message,
    });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  try {
    const contact = await checkContactOwnership(req.params.id, req.user.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Prevent changing the user field
    delete req.body.user;

    // Update the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("relatedJobs", "company position");

    res.status(200).json({
      success: true,
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact",
      error: error.message,
    });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await checkContactOwnership(req.params.id, req.user.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Delete the contact
    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error: error.message,
    });
  }
};

// Add interaction to contact
exports.addInteraction = async (req, res) => {
  try {
    const contact = await checkContactOwnership(req.params.id, req.user.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Add interaction to the contact's interactionHistory array
    contact.interactionHistory.push(req.body);

    // Update lastContactDate to this interaction's date or current date
    contact.lastContactDate = req.body.date || Date.now();

    await contact.save();

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Add interaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add interaction",
      error: error.message,
    });
  }
};

// Update interaction
exports.updateInteraction = async (req, res) => {
  try {
    const contact = await checkContactOwnership(req.params.id, req.user.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Find the interaction to update
    const interactionIndex = contact.interactionHistory.findIndex(
      (interaction) => interaction._id.toString() === req.params.interactionId
    );

    if (interactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found",
      });
    }

    // Update the interaction fields
    Object.keys(req.body).forEach((key) => {
      contact.interactionHistory[interactionIndex][key] = req.body[key];
    });

    // Check if this is the most recent interaction and update lastContactDate if needed
    if (req.body.date) {
      const mostRecentDate = contact.interactionHistory.reduce(
        (max, interaction) => (interaction.date > max ? interaction.date : max),
        new Date(0)
      );

      contact.lastContactDate = mostRecentDate;
    }

    await contact.save();

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Update interaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interaction",
      error: error.message,
    });
  }
};

// Delete interaction
exports.deleteInteraction = async (req, res) => {
  try {
    const contact = await checkContactOwnership(req.params.id, req.user.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Find the interaction to delete
    const interaction = contact.interactionHistory.find(
      (interaction) => interaction._id.toString() === req.params.interactionId
    );

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found",
      });
    }

    // Remove the interaction from the array
    contact.interactionHistory = contact.interactionHistory.filter(
      (interaction) => interaction._id.toString() !== req.params.interactionId
    );

    // Update lastContactDate to the most recent remaining interaction
    if (contact.interactionHistory.length > 0) {
      const mostRecentDate = contact.interactionHistory.reduce(
        (max, interaction) => (interaction.date > max ? interaction.date : max),
        new Date(0)
      );

      contact.lastContactDate = mostRecentDate;
    } else {
      contact.lastContactDate = null;
    }

    await contact.save();

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Delete interaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete interaction",
      error: error.message,
    });
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const contact = await checkContactOwnership(req.params.id, req.user.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Toggle favorite status
    contact.favorite = !contact.favorite;

    await contact.save();

    res.status(200).json({
      success: true,
      message: `Contact ${
        contact.favorite ? "marked as favorite" : "removed from favorites"
      }`,
      contact,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update favorite status",
      error: error.message,
    });
  }
};
