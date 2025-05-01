const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Hunt Tracker API",
      version: "1.0.0",
      description:
        "API documentation for Job Hunt Tracker, a tool that helps job seekers organize their job search process",
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Path to the API docs
  apis: [
    "./src/swagger/*.js", // We'll store all swagger definitions in one folder
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
