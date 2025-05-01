const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./v1/routes/auth.routes");
const jobRoutes = require("./v1/routes/job.routes");
const taskRoutes = require("./v1/routes/task.routes");
const contactRoutes = require("./v1/routes/contact.routes");
// const paymentRoutes = require("./v1/routes/payment.routes");
const planRoutes = require("./v1/routes/plan.routes");
const analyticsRoutes = require("./v1/routes/analytics.routes");

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    useTempFiles: true,
    tempFileDir: "./temp/",
  })
);

// Ensure swagger directory exists
const swaggerDir = path.join(__dirname, "swagger");
if (!fs.existsSync(swaggerDir)) {
  fs.mkdirSync(swaggerDir, { recursive: true });
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Job Hunt Tracker API Documentation",
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/jobs", jobRoutes);
// app.use("/api/v1/tasks", taskRoutes);
// app.use("/api/v1/contacts", contactRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/plans", planRoutes);
// app.use("/api/v1/analytics", analyticsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
  console.log(
    `API documentation available at http://localhost:${PORT}/api/docs`
  );
});

module.exports = app;
