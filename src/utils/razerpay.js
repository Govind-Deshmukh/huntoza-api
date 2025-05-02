const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay with API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new order for payment
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in paise (INR) or cents (USD)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.receipt - Order receipt ID
 * @param {Object} options.notes - Additional notes for the order
 * @returns {Promise<Object>} - Razorpay order object
 */
const createOrder = async (options) => {
  try {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        const order = await razorpay.orders.create({
          amount: options.amount,
          currency: options.currency || "INR",
          receipt: options.receipt,
          notes: options.notes || {},
        });
        return order;
      } catch (error) {
        lastError = error;

        // If rate limited, wait and retry
        if (error.statusCode === 429) {
          attempts++;
          if (attempts < maxAttempts) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempts - 1) * 1000;
            console.log(
              `Rate limited by Razorpay. Retrying in ${
                delay / 1000
              }s (Attempt ${attempts}/${maxAttempts})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } else {
          // For other errors, throw immediately
          throw error;
        }
      }
    }

    // If we've exhausted our retries
    throw lastError;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw error;
  }
};

/**
 * Verify payment signature
 * @param {Object} options - Verification options
 * @param {string} options.orderId - Razorpay order ID
 * @param {string} options.paymentId - Razorpay payment ID
 * @param {string} options.signature - Razorpay signature received
 * @returns {boolean} - Whether signature is valid
 */
const verifyPaymentSignature = (options) => {
  try {
    // Creating hmac object
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

    // Passing the data to be hashed
    hmac.update(`${options.orderId}|${options.paymentId}`);

    // Creating the hmac in the required format
    const generatedSignature = hmac.digest("hex");

    // Comparing the signatures
    return generatedSignature === options.signature;
  } catch (error) {
    console.error("Razorpay signature verification error:", error);
    return false;
  }
};

/**
 * Get payment details by payment ID
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} - Payment details
 */
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Razorpay payment fetch error:", error);
    throw error;
  }
};

/**
 * Issue a refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in paise (INR) or cents (USD)
 * @returns {Promise<Object>} - Refund details
 */
const issueRefund = async (paymentId, amount = null) => {
  try {
    const refundOptions = {};

    if (amount) {
      refundOptions.amount = amount;
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error("Razorpay refund error:", error);
    throw error;
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  issueRefund,
};
