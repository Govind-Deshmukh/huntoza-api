const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const verifyToken = require("../../middleware/verifyToken");

// Public routes
router.post("/register", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/check-reset-token/:token", authController.checkResetToken);
router.post("/refresh-token", authController.refreshToken);

// Protected routes (require authentication)
router.get("/me", verifyToken, authController.getCurrentUser);
router.post("/logout", verifyToken, authController.logout);
router.patch("/update-password", verifyToken, authController.updatePassword);
router.patch("/update-profile", verifyToken, authController.updateProfile);

module.exports = router;
