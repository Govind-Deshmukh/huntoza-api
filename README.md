# Job Hunt Tracker API

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
src/
├── config/          # Configuration files
├── middleware/      # Middleware functions
├── models/          # Mongoose schemas
├── utils/           # Utility functions
├── v1/              # API version 1
│   ├── controller/  # Route controllers
│   └── routes/      # Express routes
├── mailTemplates/   # Email templates
├── swagger/         # Swagger definitions
└── index.js         # Entry point
```

## Main Features

1. **Authentication**

   - Sign up/login with JWT
   - Password reset functionality
   - Refresh token mechanism

2. **Job Application Tracking**

   - Create, update, and delete job applications
   - Track application status (applied, screening, interview, etc.)
   - Manage interviews and documents

3. **Task Management**

   - Create and assign tasks related to job hunting
   - Set priorities, due dates, and reminders

4. **Contact Management**

   - Store recruiter and company contact information
   - Track interaction history

5. **Document Management**

   - Upload and organize resumes, cover letters
   - Version control for documents

6. **Analytics**

   - Dashboard with key metrics
   - Application statistics
   - Interview tracking

7. **Subscription Plans**

   - Free and premium tiers
   - Razorpay payment integration

8. **Notifications**
   - System notifications
   - Email alerts

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

The API documentation is available at `/api/docs` when the server is running.

## Endpoints

- **Auth**: `/api/v1/auth/*`
- **Jobs**: `/api/v1/jobs/*`
- **Tasks**: `/api/v1/tasks/*`
- **Contacts**: `/api/v1/contacts/*`
- **Plans**: `/api/v1/plans/*`
- **Payments**: `/api/v1/payments/*`
- **Analytics**: `/api/v1/analytics/*`
- **Profiles**: `/api/v1/profiles/*`
- **Documents**: `/api/v1/documents/*`
- **Notifications**: `/api/v1/notifications/*`

## License

This project is licensed under the MIT License.
