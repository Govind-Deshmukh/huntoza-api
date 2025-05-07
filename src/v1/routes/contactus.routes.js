// server/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { submitContactForm } = require("../controller/contactus.controller");

router.post("/", submitContactForm);

module.exports = router;
