/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         company:
 *           type: string
 *         position:
 *           type: string
 *         relationship:
 *           type: string
 *           enum: [recruiter, hiring-manager, colleague, referral, mentor, other]
 *         notes:
 *           type: string
 *         lastContactDate:
 *           type: string
 *           format: date-time
 *         favorite:
 *           type: boolean
 *
 *     Interaction:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         method:
 *           type: string
 *           enum: [email, call, meeting, message, other]
 *         notes:
 *           type: string
 *
 * /contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: Get all contacts with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: favorite
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *   post:
 *     tags: [Contacts]
 *     summary: Create a new contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               relationship:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 *
 * /contacts/{id}:
 *   get:
 *     tags: [Contacts]
 *     summary: Get contact by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *   patch:
 *     tags: [Contacts]
 *     summary: Update contact
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *   delete:
 *     tags: [Contacts]
 *     summary: Delete contact
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *
 * /contacts/{id}/interactions:
 *   post:
 *     tags: [Contacts]
 *     summary: Add interaction to contact
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
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               method:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interaction added successfully
 *
 * /contacts/{id}/favorite:
 *   patch:
 *     tags: [Contacts]
 *     summary: Toggle favorite status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 */
