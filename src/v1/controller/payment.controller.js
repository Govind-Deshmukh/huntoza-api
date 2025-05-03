const User = require("../../models/User");
const Plan = require("../../models/Plan");
const Transaction = require("../../models/Transaction");
const razorpay = require("../../utils/razerpay");
const { sendMail } = require("../../middleware/mailService");

// Create a Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { planId, billingType } = req.body;

    // Find the user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

    // Calculate amount based on billing type
    const amount =
      billingType === "yearly" ? plan.price.yearly : plan.price.monthly;

    // Convert amount to paise/cents (Razorpay expects amount in smallest currency unit)
    const amountInSmallestUnit = Math.round(amount * 100);

    // Generate a unique receipt ID
    const receipt = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create a new order in Razorpay
    const order = await razorpay.createOrder({
      amount: amountInSmallestUnit,
      currency: plan.price.currency || "INR",
      receipt: receipt,
      notes: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
        planName: plan.name,
        billingType: billingType,
      },
    });

    // Calculate expiry date based on billing type
    const startDate = new Date();
    const endDate = new Date();
    if (billingType === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create a transaction record (status: initiated)
    const transaction = await Transaction.create({
      user: user._id,
      plan: plan._id,
      orderId: order.id,
      amount: amount,
      currency: plan.price.currency || "INR",
      status: "initiated",
      billingType: billingType,
      startDate: startDate,
      endDate: endDate,
      billingDetails: {
        name: user.name,
        email: user.email,
      },
    });

    // Return the order details
    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      transaction: transaction._id,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// This ensures user plan is updated when payment is successful
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

    // Verify the payment signature
    const isSignatureValid = razorpay.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction with payment details
    transaction.paymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.status = "completed";
    await transaction.save();

    // Find and update user's plan
    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user's plan
    user.currentPlan = transaction.plan;
    await user.save();

    // Get plan details for email
    const plan = await Plan.findById(transaction.plan);

    // Send confirmation email
    try {
      await sendMail({
        to: user.email,
        subject: "Payment Successful - Subscription Activated",
        template: "paymentSuccess",
        data: {
          name: user.name,
          planName: plan.name,
          amount: transaction.amount,
          currency: transaction.currency,
          billingType: transaction.billingType,
          startDate: transaction.startDate.toLocaleDateString(),
          endDate: transaction.endDate.toLocaleDateString(),
          paymentId: razorpay_payment_id,
          dashboardUrl: process.env.FRONTEND_URL + "/dashboard",
          currentYear: new Date().getFullYear(),
        },
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue with the response even if email fails
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      transaction: {
        id: transaction._id,
        status: transaction.status,
        planId: transaction.plan,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId })
      .populate("plan", "name description")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment history",
      error: error.message,
    });
  }
};

// Get payment details by ID
exports.getPaymentById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).populate("plan", "name description features");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment details",
      error: error.message,
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      // Process the webhook event
      const event = req.body;

      switch (event.event) {
        case "payment.authorized":
          // Handle payment authorized
          await handlePaymentAuthorized(event.payload.payment.entity);
          break;
        case "payment.failed":
          // Handle payment failed
          await handlePaymentFailed(event.payload.payment.entity);
          break;
        // Handle other events
      }

      res.status(200).json({ status: "ok" });
    } else {
      res.status(401).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
