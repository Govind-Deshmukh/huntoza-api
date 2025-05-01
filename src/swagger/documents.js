/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [resume, cover-letter, certificate, portfolio, other]
 *         url:
 *           type: string
 *         fileSize:
 *           type: number
 *         fileType:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isDefault:
 *           type: boolean
 *         isPublic:
 *           type: boolean
 *         description:
 *           type: string
 *         version:
 *           type: number
 *
 * /documents:
 *   get:
 *     tags: [Documents]
 *     summary: Get all documents with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: type
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
 *         name: tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *   post:
 *     tags: [Documents]
 *     summary: Upload a new document
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               isDefault:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *
 * /documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get document by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *   patch:
 *     tags: [Documents]
 *     summary: Update document details
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
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 *   delete:
 *     tags: [Documents]
 *     summary: Delete document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *
 * /documents/defaults:
 *   get:
 *     tags: [Documents]
 *     summary: Get default documents for each type
 *     responses:
 *       200:
 *         description: Default documents retrieved successfully
 *
 * /documents/{id}/set-default:
 *   patch:
 *     tags: [Documents]
 *     summary: Set document as default for its type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document set as default successfully
 *
 * /documents/public/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get public document
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public document retrieved successfully
 */
