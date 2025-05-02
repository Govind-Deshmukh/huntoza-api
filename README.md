# PursuitPal API

A comprehensive RESTful API for a job hunt tracking application that helps job seekers organize their job search process from start to finish.

## Overview

This application allows users to:

- Track job applications submitted to different companies
- Organize job search activities and tasks
- Keep track of interview schedules and follow-ups
- Store and manage resumes and cover letters
- Monitor application progress with detailed analytics
- Maintain a database of professional contacts

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Payment Processing**: Razorpay
- **Email Service**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: express-fileupload

## Project Structure

```
huntoza-api
|
├── Dockerfile
├── package.json
├── README.md
├── run.sh
├── src
│   ├── config
│   │   └── swagger.js
│   ├── index.js
│   ├── mailTemplates
│   │   ├── notification.html
│   │   ├── paymentSuccess.html
│   │   ├── resetPassword.html
│   │   └── welcome.html
│   ├── middleware
│   │   ├── mailService.js
│   │   └── verifyToken.js
│   ├── models
│   │   ├── Analytics.js
│   │   ├── Contact.js
│   │   ├── Document.js
│   │   ├── Job.js
│   │   ├── Notification.js
│   │   ├── Plan.js
│   │   ├── PublicProfile.js
│   │   ├── Task.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── swagger
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── components.js
│   │   ├── contact.js
│   │   ├── documents.js
│   │   ├── jobs.js
│   │   ├── notifications.js
│   │   ├── payments.js
│   │   ├── plans.js
│   │   ├── profile.js
│   │   └── tasks.js
│   ├── utils
│   │   ├── notificationHelpers.js
│   │   ├── razerpay.js
│   │   └── scheduler.js
│   └── v1
│       ├── controller
│       │   ├── analytics.controller.js
│       │   ├── auth.controller.js
│       │   ├── contact.controller.js
│       │   ├── document.controller.js
│       │   ├── job.controller.js
│       │   ├── notification.controller.js
│       │   ├── payment.controller.js
│       │   ├── plan.controller.js
│       │   ├── publicProfile.controller.js
│       │   └── task.controller.js
│       └── routes
│           ├── analytics.routes.js
│           ├── auth.routes.js
│           ├── contact.routes.js
│           ├── document.routes.js
│           ├── job.routes.js
│           ├── notification.routes.js
│           ├── payment.routes.js
│           ├── plan.routes.js
│           ├── publicProfile.routes.js
│           └── task.routes.js
├── temp
└── uploads
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_LIFETIME=1d
   REFRESH_TOKEN_LIFETIME=7d
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USERNAME=your_smtp_username
   SMTP_PASSWORD=your_smtp_password
   SMTP_SECURE=true/false
   EMAIL_FROM=your_email_address
   FRONTEND_URL=your_frontend_url
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ENABLE_SCHEDULERS=true/false
   ```
4. Start the server:
   ```
   npm start
   ```
   For development:
   ```
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api/docs` when the server is running. Below is a detailed overview of each API endpoint.

## Authentication API (`/api/v1/auth`)

### User Registration

- **POST** `/api/v1/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": { "name": "John Doe", "email": "john@example.com", ... },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
  ```

### User Login

- **POST** `/api/v1/auth/login`
- **Description**: Authenticate a user
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": { "name": "John Doe", "email": "john@example.com", ... },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
  ```

### Refresh Token

- **POST** `/api/v1/auth/refresh-token`
- **Description**: Get a new access token using refresh token
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
  ```

### Forgot Password

- **POST** `/api/v1/auth/forgot-password`
- **Description**: Request password reset link
- **Request Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```

### Reset Password

- **POST** `/api/v1/auth/reset-password/:token`
- **Description**: Reset password using reset token
- **Request Body**:
  ```json
  {
    "password": "new_secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successful",
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
  ```

### Get Current User

- **GET** `/api/v1/auth/me`
- **Description**: Get current user profile
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "user": { "name": "John Doe", "email": "john@example.com", ... }
  }
  ```

### Update Profile

- **PATCH** `/api/v1/auth/update-profile`
- **Description**: Update user profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "email": "johnsmith@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": { "name": "John Smith", "email": "johnsmith@example.com", ... }
  }
  ```

### Update Password

- **PATCH** `/api/v1/auth/update-password`
- **Description**: Update user password
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "currentPassword": "old_password",
    "newPassword": "new_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully",
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
  ```

### Logout

- **POST** `/api/v1/auth/logout`
- **Description**: Logout user
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## Jobs API (`/api/v1/jobs`)

### Get All Jobs

- **GET** `/api/v1/jobs`
- **Description**: Get all jobs with filtering and pagination
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by job status (`applied`, `screening`, `interview`, etc.)
  - `jobType`: Filter by job type (`full-time`, `part-time`, etc.)
  - `search`: Search in company name or position
  - `sort`: Sort options (`newest`, `oldest`, `a-z`, etc.)
  - `page`: Page number
  - `limit`: Items per page
  - `favorite`: Filter favorites (`true` or `false`)
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "totalJobs": 50,
    "numOfPages": 5,
    "currentPage": 1,
    "jobs": [{ "company": "Google", "position": "Software Engineer", ... }]
  }
  ```

### Create Job

- **POST** `/api/v1/jobs`
- **Description**: Create a new job application
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "company": "Google",
    "position": "Software Engineer",
    "status": "applied",
    "jobType": "full-time",
    "jobLocation": "Remote",
    "jobDescription": "...",
    "jobUrl": "https://careers.google.com/...",
    "salary": {
      "min": 100000,
      "max": 150000,
      "currency": "USD"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", ... }
  }
  ```

### Get Job by ID

- **GET** `/api/v1/jobs/:id`
- **Description**: Get job details by ID
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", ... }
  }
  ```

### Update Job

- **PATCH** `/api/v1/jobs/:id`
- **Description**: Update job details
- **Authentication**: Required
- **Request Body**: Fields to update
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", ... }
  }
  ```

### Delete Job

- **DELETE** `/api/v1/jobs/:id`
- **Description**: Delete a job
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```

### Add Interview

- **POST** `/api/v1/jobs/:id/interviews`
- **Description**: Add interview to a job
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "date": "2025-05-15T10:00:00Z",
    "interviewType": "video",
    "withPerson": "John Recruiter",
    "notes": "Prepare project examples",
    "followUpDate": "2025-05-16T10:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", "interviewHistory": [...] }
  }
  ```

### Update Interview

- **PATCH** `/api/v1/jobs/:id/interviews/:interviewId`
- **Description**: Update interview details
- **Authentication**: Required
- **Request Body**: Fields to update
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", "interviewHistory": [...] }
  }
  ```

### Delete Interview

- **DELETE** `/api/v1/jobs/:id/interviews/:interviewId`
- **Description**: Delete an interview
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", "interviewHistory": [...] }
  }
  ```

### Upload Document

- **POST** `/api/v1/jobs/:id/documents`
- **Description**: Upload document for a job (resume, cover letter, etc.)
- **Authentication**: Required
- **Request Body**: Form data with file and metadata
- **Response**:
  ```json
  {
    "success": true,
    "job": { "company": "Google", "position": "Software Engineer", "documents": {...} },
    "document": { "name": "resume.pdf", "url": "/uploads/user-id/resume.pdf", "type": "resume" }
  }
  ```

### Delete Document

- **DELETE** `/api/v1/jobs/:id/documents/:documentId`
- **Description**: Delete a document
- **Authentication**: Required
- **Query Parameters**:
  - `type`: Document type (`resume`, `coverLetter`, or `other`)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully",
    "job": { "company": "Google", "position": "Software Engineer", "documents": {...} }
  }
  ```

## Tasks API (`/api/v1/tasks`)

### Get All Tasks

- **GET** `/api/v1/tasks`
- **Description**: Get all tasks with filtering and pagination
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by task status (`pending`, `in-progress`, `completed`, etc.)
  - `priority`: Filter by priority (`low`, `medium`, `high`)
  - `category`: Filter by category (`application`, `networking`, etc.)
  - `search`: Search in title or description
  - `sort`: Sort options
  - `page`: Page number
  - `limit`: Items per page
  - `dueDate`: Filter by due date (`today`, `upcoming`, `overdue`)
  - `relatedJob`: Filter by related job ID
  - `relatedContact`: Filter by related contact ID
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "totalTasks": 50,
    "numOfPages": 5,
    "currentPage": 1,
    "tasks": [{ "title": "Update resume", "status": "pending", ... }]
  }
  ```

### Create Task

- **POST** `/api/v1/tasks`
- **Description**: Create a new task
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "Update resume",
    "description": "Add recent project experience",
    "status": "pending",
    "priority": "high",
    "dueDate": "2025-05-10T10:00:00Z",
    "category": "application",
    "relatedJob": "job_id",
    "relatedContact": "contact_id"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "task": { "title": "Update resume", "status": "pending", ... }
  }
  ```

### Get Task by ID

- **GET** `/api/v1/tasks/:id`
- **Description**: Get task details by ID
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "task": { "title": "Update resume", "status": "pending", ... }
  }
  ```

### Update Task

- **PATCH** `/api/v1/tasks/:id`
- **Description**: Update task details
- **Authentication**: Required
- **Request Body**: Fields to update
- **Response**:
  ```json
  {
    "success": true,
    "task": { "title": "Update resume", "status": "in-progress", ... }
  }
  ```

### Delete Task

- **DELETE** `/api/v1/tasks/:id`
- **Description**: Delete a task
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

### Complete Task

- **PATCH** `/api/v1/tasks/:id/complete`
- **Description**: Mark task as completed
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Task marked as completed",
    "task": { "title": "Update resume", "status": "completed", ... }
  }
  ```

## Contacts API (`/api/v1/contacts`)

### Get All Contacts

- **GET** `/api/v1/contacts`
- **Description**: Get all contacts with filtering and pagination
- **Authentication**: Required
- **Query Parameters**:
  - `relationship`: Filter by relationship (`recruiter`, `hiring-manager`, etc.)
  - `search`: Search in name, email, company, or position
  - `sort`: Sort options
  - `page`: Page number
  - `limit`: Items per page
  - `favorite`: Filter favorites (`true` or `false`)
  - `tag`: Filter by tag
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "totalContacts": 50,
    "numOfPages": 5,
    "currentPage": 1,
    "contacts": [{ "name": "Jane Recruiter", "company": "Google", ... }]
  }
  ```

### Create Contact

- **POST** `/api/v1/contacts`
- **Description**: Create a new contact
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Jane Recruiter",
    "email": "jane@google.com",
    "phone": "123-456-7890",
    "company": "Google",
    "position": "Technical Recruiter",
    "relationship": "recruiter",
    "notes": "Met at job fair"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "contact": { "name": "Jane Recruiter", "company": "Google", ... }
  }
  ```

### Get Contact by ID

- **GET** `/api/v1/contacts/:id`
- **Description**: Get contact details by ID
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "contact": { "name": "Jane Recruiter", "company": "Google", ... }
  }
  ```

### Update Contact

- **PATCH** `/api/v1/contacts/:id`
- **Description**: Update contact details
- **Authentication**: Required
- **Request Body**: Fields to update
- **Response**:
  ```json
  {
    "success": true,
    "contact": { "name": "Jane Recruiter", "company": "Google", ... }
  }
  ```

### Delete Contact

- **DELETE** `/api/v1/contacts/:id`
- **Description**: Delete a contact
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Contact deleted successfully"
  }
  ```

### Add Interaction

- **POST** `/api/v1/contacts/:id/interactions`
- **Description**: Add interaction to a contact
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "date": "2025-05-01T10:00:00Z",
    "method": "email",
    "notes": "Discussed job opportunity"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "contact": { "name": "Jane Recruiter", "interactionHistory": [...] }
  }
  ```

### Update Interaction

- **PATCH** `/api/v1/contacts/:id/interactions/:interactionId`
- **Description**: Update interaction details
- **Authentication**: Required
- **Request Body**: Fields to update
- **Response**:
  ```json
  {
    "success": true,
    "contact": { "name": "Jane Recruiter", "interactionHistory": [...] }
  }
  ```

### Delete Interaction

- **DELETE** `/api/v1/contacts/:id/interactions/:interactionId`
- **Description**: Delete an interaction
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "contact": { "name": "Jane Recruiter", "interactionHistory": [...] }
  }
  ```

### Toggle Favorite

- **PATCH** `/api/v1/contacts/:id/favorite`
- **Description**: Toggle favorite status
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Contact marked as favorite",
    "contact": { "name": "Jane Recruiter", "favorite": true, ... }
  }
  ```

## Plans API (`/api/v1/plans`)

### Get All Plans

- **GET** `/api/v1/plans`
- **Description**: Get all available subscription plans
- **Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "plans": [
      { "name": "free", "description": "Free tier", "price": {...}, "features": [...] },
      { "name": "basic", "description": "Basic tier", "price": {...}, "features": [...] },
      { "name": "premium", "description": "Premium tier", "price": {...}, "features": [...] }
    ]
  }
  ```

### Get Plan by ID

- **GET** `/api/v1/plans/:id`
- **Description**: Get details of a specific plan
- **Response**:
  ```json
  {
    "success": true,
    "plan": { "name": "premium", "description": "Premium tier", "price": {...}, "features": [...] }
  }
  ```

### Get Current Plan

- **GET** `/api/v1/plans/user/current`
- **Description**: Get current user's plan details
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "plan": { "name": "basic", "description": "Basic tier", ... },
    "subscription": {
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2026-01-01T00:00:00Z",
      "billingType": "yearly",
      "status": "active"
    }
  }
  ```

### Initiate Plan Upgrade

- **POST** `/api/v1/plans/upgrade`
- **Description**: Initiate a plan upgrade
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "planId": "plan_id",
    "billingType": "monthly"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Ready to upgrade plan",
    "planId": "plan_id",
    "planName": "premium",
    "billingType": "monthly",
    "nextStep": "payment"
  }
  ```

### Cancel Subscription

- **POST** `/api/v1/plans/cancel`
- **Description**: Cancel current subscription (downgrade to free plan)
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Subscription cancelled successfully",
    "currentPlan": "free"
  }
  ```

## Payments API (`/api/v1/payments`)

### Create Order

- **POST** `/api/v1/payments/create-order`
- **Description**: Create a Razorpay order for payment
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "planId": "plan_id",
    "billingType": "monthly"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order_id",
      "amount": 9900,
      "currency": "INR",
      "receipt": "receipt_id",
      "notes": {...}
    },
    "keyId": "razorpay_key_id",
    "transaction": "transaction_id",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### Verify Payment

- **POST** `/api/v1/payments/verify`
- **Description**: Verify payment after completion
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_id",
    "razorpay_payment_id": "payment_id",
    "razorpay_signature": "signature",
    "transactionId": "transaction_id"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "transaction": {
      "id": "transaction_id",
      "status": "completed",
      "planId": "plan_id"
    }
  }
  ```

### Get Payment History

- **GET** `/api/v1/payments/history`
- **Description**: Get user's payment history
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "transactions": [{ "plan": { "name": "premium" }, "amount": 99, "status": "completed", ... }]
  }
  ```

### Get Payment by ID

- **GET** `/api/v1/payments/:id`
- **Description**: Get payment details by ID
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "transaction": { "plan": { "name": "premium", "features": [...] }, "amount": 99, "status": "completed", ... }
  }
  ```

## Analytics API (`/api/v1/analytics`)

### Get Dashboard Analytics

- **GET** `/api/v1/analytics/dashboard`
- **Description**: Get summary analytics for the dashboard
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "applicationStats": { "total": 50, "applied": 30, "interview": 10, "offer": 5, "rejected": 5 },
      "upcomingInterviews": [...],
      "pendingTasks": [...],
      "recentApplications": [...],
      "applicationTimeline": [...],
      "activityOverview": { "totalContacts": 20, "completedTasks": 15, "pendingTasks": 10, "upcomingInterviewCount": 3 }
    }
  }
  ```

### Get Application Analytics

- **GET** `/api/v1/analytics/applications`
- **Description**: Get application analytics
- **Authentication**: Required
- **Query Parameters**:
  - `period`: Time period (`last-week`, `last-month`, `last-3-months`, `last-6-months`, `last-year`, `all-time`)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "statusDistribution": [...],
      "jobTypeDistribution": [...],
      "applicationTimeline": [...],
      "topCompanies": [...],
      "responseRate": 45,
      "totalApplications": 50,
      "respondedApplications": 20
    }
  }
  ```

### Get Interview Analytics

- **GET** `/api/v1/analytics/interviews`
- **Description**: Get interview analytics
- **Authentication**: Required
- **Query Parameters**:
  - `period`: Time period (`last-month`, `last-3-months`, `last-6-months`, `last-year`, `all-time`)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalInterviews": 20,
      "interviewTypeDistribution": { "phone": 8, "video": 10, "in-person": 2 },
      "interviewOutcomes": { "pending": 5, "success": 10, "rejected": 5, "total": 20 },
      "successRate": 50,
      "interviewsByCompany": [...],
      "interviewTimeline": [...],
      "upcomingInterviews": [...]
    }
  }
  ```

### Get Task Analytics

- **GET** `/api/v1/analytics/tasks`
- **Description**: Get task analytics
- **Authentication**: Required
- **Query Parameters**:
  - `period`: Time period (`last-week`, `last-month`, `last-3-months`)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalTasks": 50,
      "completedTasks": 35,
      "taskStatusDistribution": { "pending": 10, "in-progress": 5, "completed": 35 },
      "categoryDistribution": [...],
      "completionRate": 70,
      "completionTimeline": [...],
      "overdueTasks": 3,
      "avgCompletionTimeDays": 2.5
    }
  }
  ```

### Get Networking Analytics

- **GET** `/api/v1/analytics/networking`
- **Description**: Get networking analytics
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalContacts": 30,
      "contactsWithInteractions": 20,
      "totalInteractions": 45,
      "engagementRate": 67,
      "relationshipDistribution": { "recruiter": 15, "hiring-manager": 8, "colleague": 7 },
      "interactionMethodDistribution": { "email": 25, "call": 10, "meeting": 5, "message": 5 },
      "interactionTimeline": [...],
      "topContacts": [...],
      "followUpsDue": [...]
    }
  }
  ```

## Documents API (`/api/v1/documents`)

### Get All Documents

- **GET** `/api/v1/documents`
- **Description**: Get all documents with filtering and pagination
- **Authentication**: Required
- **Query Parameters**:
  - `type`: Filter by document type (`resume`, `cover-letter`, etc.)
  - `search`: Search in name or description
  - `sort`: Sort options
  - `page`: Page number
  - `limit`: Items per page
  - `tag`: Filter by tag
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "totalDocuments": 25,
    "numOfPages": 3,
    "currentPage": 1,
    "documents": [{ "name": "Resume.pdf", "type": "resume", ... }],
    "storage": {
      "used": 15.5,
      "usedBytes": 16252928
    }
  }
  ```

### Upload Document

- **POST** `/api/v1/documents`
- **Description**: Upload a new document
- **Authentication**: Required
- **Request Body**: Form data with file and metadata
  ```
  document: [FILE]
  name: "Resume.pdf"
  type: "resume"
  description: "Software Engineer Resume"
  tags: ["tech", "engineering"]
  isDefault: "true"
  ```
- **Response**:
  ```json
  {
    "success": true,
    "document": {
      "name": "Resume.pdf",
      "type": "resume",
      "url": "/uploads/user-id/documents/resume.pdf",
      "fileSize": 256000,
      "tags": ["tech", "engineering"],
      "isDefault": true
    }
  }
  ```

### Get Document by ID

- **GET** `/api/v1/documents/:id`
- **Description**: Get document details by ID
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "document": {
      "name": "Resume.pdf",
      "type": "resume",
      "url": "/uploads/user-id/documents/resume.pdf",
      "fileSize": 256000,
      "tags": ["tech", "engineering"],
      "isDefault": true
    }
  }
  ```

### Update Document

- **PATCH** `/api/v1/documents/:id`
- **Description**: Update document details
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Updated Resume.pdf",
    "description": "Updated Software Engineer Resume",
    "tags": ["tech", "engineering", "senior"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "document": {
      "name": "Updated Resume.pdf",
      "type": "resume",
      "description": "Updated Software Engineer Resume",
      "tags": ["tech", "engineering", "senior"],
      "isDefault": true
    }
  }
  ```

### Delete Document

- **DELETE** `/api/v1/documents/:id`
- **Description**: Delete a document
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```

### Get Default Documents

- **GET** `/api/v1/documents/defaults`
- **Description**: Get default documents for each type
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "defaultDocuments": {
      "resume": { "name": "Resume.pdf", "type": "resume", ... },
      "cover-letter": { "name": "Cover Letter.pdf", "type": "cover-letter", ... },
      "certificate": null,
      "portfolio": null,
      "other": null
    }
  }
  ```

### Set Document as Default

- **PATCH** `/api/v1/documents/:id/set-default`
- **Description**: Set document as default for its type
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Document set as default resume",
    "document": { "name": "Resume.pdf", "type": "resume", "isDefault": true, ... }
  }
  ```

### Get All Tags

- **GET** `/api/v1/documents/tags/all`
- **Description**: Get all document tags
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "tags": ["tech", "engineering", "senior", "creative", "management"]
  }
  ```

### Toggle Public Status

- **PATCH** `/api/v1/documents/:id/toggle-public`
- **Description**: Toggle document public status
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Document is now public",
    "document": { "name": "Resume.pdf", "isPublic": true, ... }
  }
  ```

### Get Public Document

- **GET** `/api/v1/documents/public/:id`
- **Description**: Get public document (accessible without authentication)
- **Response**:
  ```json
  {
    "success": true,
    "document": {
      "name": "Resume.pdf",
      "type": "resume",
      "description": "Software Engineer Resume",
      "url": "/uploads/user-id/documents/resume.pdf",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
  ```

## Public Profiles API (`/api/v1/profiles`)

### Get User Profile

- **GET** `/api/v1/profiles`
- **Description**: Get user's own public profile
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "profile": {
      "profileId": "johndoe-abc123",
      "headline": "Software Engineer with 5 years of experience",
      "about": "...",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": [...],
      "education": [...],
      "visibility": "public"
    }
  }
  ```

### Create or Update Profile

- **POST** `/api/v1/profiles`
- **Description**: Create or update public profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "headline": "Senior Software Engineer with 5 years of experience",
    "about": "...",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experience": [
      {
        "title": "Software Engineer",
        "company": "Tech Co",
        "location": "Remote",
        "from": "2022-01-01T00:00:00Z",
        "to": null,
        "current": true,
        "description": "..."
      }
    ],
    "education": [...],
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile created successfully",
    "profile": { "profileId": "johndoe-abc123", "headline": "Senior Software Engineer with 5 years of experience", ... }
  }
  ```

### Get Public Profile by ProfileId

- **GET** `/api/v1/profiles/view/:profileId`
- **Description**: View someone's public profile (accessible without authentication)
- **Response**:
  ```json
  {
    "success": true,
    "profile": {
      "headline": "Senior Software Engineer with 5 years of experience",
      "about": "...",
      "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "experience": [...],
      "education": [...],
      "projects": [...],
      "socialLinks": {...}
    }
  }
  ```

### Toggle Profile Status

- **PATCH** `/api/v1/profiles/toggle-status`
- **Description**: Toggle profile active status
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile is now active",
    "profile": { "profileId": "johndoe-abc123", "isActive": true, ... }
  }
  ```

### Update Profile Visibility

- **PATCH** `/api/v1/profiles/visibility`
- **Description**: Update profile visibility
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "visibility": "link-only"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile visibility updated to link-only",
    "profile": { "profileId": "johndoe-abc123", "visibility": "link-only", ... }
  }
  ```

### Delete Profile

- **DELETE** `/api/v1/profiles`
- **Description**: Delete public profile
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile deleted successfully"
  }
  ```

### Get Profile Metrics

- **GET** `/api/v1/profiles/metrics`
- **Description**: Get profile view metrics
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "metrics": {
      "views": 125,
      "lastViewed": "2025-04-30T15:45:00Z",
      "uniqueVisitors": 80
    }
  }
  ```

## Notifications API (`/api/v1/notifications`)

### Get All Notifications

- **GET** `/api/v1/notifications`
- **Description**: Get all notifications with filtering and pagination
- **Authentication**: Required
- **Query Parameters**:
  - `read`: Filter by read status (`true` or `false`)
  - `type`: Filter by notification type (`job`, `task`, etc.)
  - `priority`: Filter by priority (`low`, `medium`, `high`)
  - `page`: Page number
  - `limit`: Items per page
  - `sort`: Sort options (`newest`, `oldest`, `priority`)
- **Response**:
  ```json
  {
    "success": true,
    "notifications": [{ "title": "Interview Scheduled", "message": "...", "read": false, ... }],
    "count": 10,
    "totalNotifications": 45,
    "unreadCount": 15,
    "numOfPages": 5,
    "currentPage": 1
  }
  ```

### Get Unread Count

- **GET** `/api/v1/notifications/unread-count`
- **Description**: Get count of unread notifications
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "unreadCount": 15
  }
  ```

### Mark as Read

- **PATCH** `/api/v1/notifications/:id/read`
- **Description**: Mark a notification as read
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "notification": { "title": "Interview Scheduled", "read": true, ... }
  }
  ```

### Mark All as Read

- **PATCH** `/api/v1/notifications/mark-all-read`
- **Description**: Mark all notifications as read
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read",
    "count": 15
  }
  ```

### Delete Notification

- **DELETE** `/api/v1/notifications/:id`
- **Description**: Delete a notification
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully"
  }
  ```

### Delete All Read

- **DELETE** `/api/v1/notifications/delete-all-read`
- **Description**: Delete all read notifications
- **Authentication**: Required
- **Response**:
  ```json
  {
    "success": true,
    "message": "All read notifications deleted",
    "count": 30
  }
  ```

## License

This project is licensed under the MIT License.
