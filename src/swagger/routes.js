/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Jobs
 *     description: Job application endpoints
 *   - name: Tasks
 *     description: Task management endpoints
 *   - name: Contacts
 *     description: Contact management endpoints
 *   - name: Plans
 *     description: Subscription plan endpoints
 *   - name: Payments
 *     description: Payment endpoints
 *   - name: Analytics
 *     description: Analytics endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     security: []
 *
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     security: []
 *
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *
 * /auth/check-reset-token/{token}:
 *   get:
 *     summary: Verify reset token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *
 * /auth/update-password:
 *   patch:
 *     summary: Update password
 *     tags: [Auth]
 *
 * /auth/update-profile:
 *   patch:
 *     summary: Update profile
 *     tags: [Auth]
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *   post:
 *     summary: Create new job
 *     tags: [Jobs]
 *
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *   patch:
 *     summary: Update job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /jobs/{id}/interviews:
 *   post:
 *     summary: Add interview
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /jobs/{id}/interviews/{interviewId}:
 *   patch:
 *     summary: Update interview
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: interviewId
 *         required: true
 *   delete:
 *     summary: Delete interview
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: interviewId
 *         required: true
 *
 * /jobs/{id}/documents:
 *   post:
 *     summary: Upload document
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /jobs/{id}/documents/{documentId}:
 *   delete:
 *     summary: Delete document
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: documentId
 *         required: true
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *   post:
 *     summary: Create new task
 *     tags: [Tasks]
 *
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *   patch:
 *     summary: Update task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /tasks/{id}/complete:
 *   patch:
 *     summary: Mark task as completed
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *   post:
 *     summary: Create new contact
 *     tags: [Contacts]
 *
 * /contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *   patch:
 *     summary: Update contact
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *   delete:
 *     summary: Delete contact
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /contacts/{id}/interactions:
 *   post:
 *     summary: Add interaction
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /contacts/{id}/interactions/{interactionId}:
 *   patch:
 *     summary: Update interaction
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: interactionId
 *         required: true
 *   delete:
 *     summary: Delete interaction
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: path
 *         name: interactionId
 *         required: true
 *
 * /contacts/{id}/favorite:
 *   patch:
 *     summary: Toggle favorite status
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     security: []
 *
 * /plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 * /plans/user/current:
 *   get:
 *     summary: Get current user's plan
 *     tags: [Plans]
 *
 * /plans/upgrade:
 *   post:
 *     summary: Initiate plan upgrade
 *     tags: [Plans]
 *
 * /plans/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Plans]
 */

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Payments]
 *
 * /payments/verify:
 *   post:
 *     summary: Verify payment
 *     tags: [Payments]
 *
 * /payments/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *
 * /payments/{id}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Analytics]
 *
 * /analytics/applications:
 *   get:
 *     summary: Get application analytics
 *     tags: [Analytics]
 *
 * /analytics/interviews:
 *   get:
 *     summary: Get interview analytics
 *     tags: [Analytics]
 *
 * /analytics/tasks:
 *   get:
 *     summary: Get task analytics
 *     tags: [Analytics]
 *
 * /analytics/networking:
 *   get:
 *     summary: Get networking analytics
 *     tags: [Analytics]
 */
