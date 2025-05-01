/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           enum: [free, basic, premium, enterprise]
 *         description:
 *           type: string
 *         price:
 *           type: object
 *           properties:
 *             monthly:
 *               type: number
 *             yearly:
 *               type: number
 *             currency:
 *               type: string
 *         features:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               included:
 *                 type: boolean
 *         limits:
 *           type: object
 *           properties:
 *             jobApplications:
 *               type: number
 *             contacts:
 *               type: number
 *             documents:
 *               type: number
 *
 * /plans:
 *   get:
 *     tags: [Plans]
 *     summary: Get all active plans
 *     security: []
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *
 * /plans/{id}:
 *   get:
 *     tags: [Plans]
 *     summary: Get plan by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *
 * /plans/user/current:
 *   get:
 *     tags: [Plans]
 *     summary: Get current user's plan
 *     responses:
 *       200:
 *         description: Current plan retrieved successfully
 *
 * /plans/upgrade:
 *   post:
 *     tags: [Plans]
 *     summary: Initiate plan upgrade
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
 *         description: Plan upgrade initiated successfully
 *
 * /plans/cancel:
 *   post:
 *     tags: [Plans]
 *     summary: Cancel subscription
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 */
