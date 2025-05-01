/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         company:
 *           type: string
 *         position:
 *           type: string
 *         status:
 *           type: string
 *           enum: [applied, screening, interview, offer, rejected, withdrawn, saved]
 *         jobType:
 *           type: string
 *           enum: [full-time, part-time, contract, internship, remote, other]
 *         jobLocation:
 *           type: string
 *         applicationDate:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *
 * /jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: Get all jobs with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *   post:
 *     tags: [Jobs]
 *     summary: Create a new job application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, position]
 *             properties:
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               status:
 *                 type: string
 *               jobType:
 *                 type: string
 *               jobLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *
 * /jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get job by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *   patch:
 *     tags: [Jobs]
 *     summary: Update job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *   delete:
 *     tags: [Jobs]
 *     summary: Delete job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *
 * /jobs/{id}/interviews:
 *   post:
 *     tags: [Jobs]
 *     summary: Add interview to job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, interviewType]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               interviewType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interview added successfully
 */
