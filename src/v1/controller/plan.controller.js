const User = require("../../models/User");
const Plan = require("../../models/Plan");
const Transaction = require("../../models/Transaction");

// Get all active plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .select("name description price features limits")
      .sort({ "price.monthly": 1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error("Get all plans error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve plans",
      error: error.message,
    });
  }
};

// Get plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Get plan by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve plan",
      error: error.message,
    });
  }
};

// Get current user's plan
exports.getCurrentPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "currentPlan",
      "name description price features limits"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a currentPlan
    if (!user.currentPlan) {
      return res.status(200).json({
        success: true,
        plan: null,
        subscription: null,
      });
    }

    // Get the latest active transaction for this plan
    const latestTransaction = await Transaction.findOne({
      user: user._id,
      plan: user.currentPlan._id,
      status: "completed",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      plan: user.currentPlan,
      subscription: latestTransaction
        ? {
            startDate: latestTransaction.startDate,
            endDate: latestTransaction.endDate,
            billingType: latestTransaction.billingType,
            status:
              new Date() > latestTransaction.endDate ? "expired" : "active",
          }
        : null,
    });
  } catch (error) {
    console.error("Get current plan error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve current plan",
      error: error.message,
    });
  }
};

// Initiate plan upgrade
exports.initiatePlanUpgrade = async (req, res) => {
  try {
    const { planId, billingType } = req.body;

    if (!planId || !billingType) {
      return res.status(400).json({
        success: false,
        message: "Plan ID and billing type are required",
      });
    }

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already on this plan
    if (user.currentPlan.toString() === planId) {
      return res.status(400).json({
        success: false,
        message: "You are already on this plan",
      });
    }

    // Check if plan is "free"
    if (plan.name === "free") {
      // If downgrading to free plan, update user's plan directly
      user.currentPlan = plan._id;
      await user.save();

      // Create a transaction record for the free plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100); // Basically forever

      await Transaction.create({
        user: user._id,
        plan: plan._id,
        orderId: `free_${Date.now()}`,
        amount: 0,
        currency: "INR",
        status: "completed",
        billingType: "one-time",
        startDate,
        endDate,
        billingDetails: {
          name: user.name,
          email: user.email,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Successfully downgraded to free plan",
        plan: plan.name,
      });
    }

    // For paid plans, redirect to the payment flow
    // This will be handled by the frontend redirecting to the payment page
    res.status(200).json({
      success: true,
      message: "Ready to upgrade plan",
      planId: plan._id,
      planName: plan.name,
      billingType,
      nextStep: "payment",
    });
  } catch (error) {
    console.error("Initiate plan upgrade error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate plan upgrade",
      error: error.message,
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.userId).populate(
      "currentPlan",
      "name"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user is already on free plan
    if (user.currentPlan.name === "free") {
      return res.status(400).json({
        success: false,
        message: "You are already on the free plan",
      });
    }

    // Find the free plan
    const freePlan = await Plan.findOne({ name: "free" });
    if (!freePlan) {
      return res.status(500).json({
        success: false,
        message: "System error: Free plan not found",
      });
    }

    // Update user's plan to free
    user.currentPlan = freePlan._id;
    await user.save();

    // Create a transaction record for the downgrade
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100); // Basically forever

    await Transaction.create({
      user: user._id,
      plan: freePlan._id,
      orderId: `downgrade_${Date.now()}`,
      amount: 0,
      currency: "INR",
      status: "completed",
      billingType: "one-time",
      startDate,
      endDate,
      billingDetails: {
        name: user.name,
        email: user.email,
      },
      notes: "Subscription cancelled, downgraded to free plan",
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      currentPlan: "free",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};
