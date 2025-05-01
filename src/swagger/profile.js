/**
 * @swagger
 * components:
 *   schemas:
 *     PublicProfile:
 *       type: object
 *       properties:
 *         profileId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         headline:
 *           type: string
 *         about:
 *           type: string
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         visibility:
 *           type: string
 *           enum: [public, private, link-only]
 *
 * /profiles:
 *   get:
 *     tags: [Profiles]
 *     summary: Get user's own profile
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *   post:
 *     tags: [Profiles]
 *     summary: Create or update profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               headline:
 *                 type: string
 *               about:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       200:
 *         description: Profile updated successfully
 *
 * /profiles/view/{profileId}:
 *   get:
 *     tags: [Profiles]
 *     summary: Get public profile by profileId
 *     security: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *
 * /profiles/toggle-status:
 *   patch:
 *     tags: [Profiles]
 *     summary: Toggle profile active status
 *     responses:
 *       200:
 *         description: Profile status toggled successfully
 *
 * /profiles/visibility:
 *   patch:
 *     tags: [Profiles]
 *     summary: Update profile visibility
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [visibility]
 *             properties:
 *               visibility:
 *                 type: string
 *                 enum: [public, private, link-only]
 *     responses:
 *       200:
 *         description: Profile visibility updated successfully
 *
 * /profiles/metrics:
 *   get:
 *     tags: [Profiles]
 *     summary: Get profile metrics
 *     responses:
 *       200:
 *         description: Profile metrics retrieved successfully
 */
