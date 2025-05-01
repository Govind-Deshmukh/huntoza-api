/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         plan:
 *           type: string
 *         orderId:
 *           type: string
 *         paymentId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [initiated, pending, completed, failed, refunded]
 *         billingType:
 *           type: string
 *           enum: [monthly, yearly, one-time]
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *
 * /payments/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create a Razorpay order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId, billingType]
 *             properties:
 *               planId:
 *                 type: string
 *               billingType:
 *                 type: string
 *                 enum: [monthly, yearly]
 *     responses:
 *       200:
 *         description: Order created successfully
 *
 * /payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify payment after completion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *
 * /payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Get user's payment history
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 */
