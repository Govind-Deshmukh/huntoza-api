/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [job, task, contact, system, payment, other]
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         read:
 *           type: boolean
 *         actionLink:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *
 * /notifications/mark-all-read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *
 * /notifications/delete-all-read:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete all read notifications
 *     responses:
 *       200:
 *         description: All read notifications deleted successfully
 */
