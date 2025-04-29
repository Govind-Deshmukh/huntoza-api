const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment.controller");
const verifyToken = require("../../middleware/verifyToken");

// All payment routes are protected
router.use(verifyToken);

// Create a Razorpay order
router.post("/create-order", paymentController.createOrder);

// Verify payment after completion
router.post("/verify", paymentController.verifyPayment);

// Get user's payment history
router.get("/history", paymentController.getPaymentHistory);

// Get payment details by ID
router.get("/:id", paymentController.getPaymentById);

module.exports = router;
