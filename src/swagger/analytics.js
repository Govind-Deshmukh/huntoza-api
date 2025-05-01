/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard analytics
 *     description: Retrieves summary analytics for the dashboard
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *
 * /analytics/applications:
 *   get:
 *     tags: [Analytics]
 *     summary: Get application analytics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [last-week, last-month, last-3-months, last-6-months, last-year, all-time]
 *     responses:
 *       200:
 *         description: Application analytics retrieved successfully
 *
 * /analytics/interviews:
 *   get:
 *     tags: [Analytics]
 *     summary: Get interview analytics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [last-month, last-3-months, last-6-months, last-year, all-time]
 *     responses:
 *       200:
 *         description: Interview analytics retrieved successfully
 *
 * /analytics/tasks:
 *   get:
 *     tags: [Analytics]
 *     summary: Get task analytics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [last-week, last-month, last-3-months]
 *     responses:
 *       200:
 *         description: Task analytics retrieved successfully
 *
 * /analytics/networking:
 *   get:
 *     tags: [Analytics]
 *     summary: Get networking analytics
 *     responses:
 *       200:
 *         description: Networking analytics retrieved successfully
 */
