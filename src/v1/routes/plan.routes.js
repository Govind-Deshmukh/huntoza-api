const express = require("express");
const router = express.Router();
const planController = require("../controller/plan.controller");
const verifyToken = require("../../middleware/verifyToken");

// Public routes
router.get("/", planController.getAllPlans);
router.get("/:id", planController.getPlanById);

// Protected routes
router.get("/user/current", verifyToken, planController.getCurrentPlan);
router.post("/upgrade", verifyToken, planController.initiatePlanUpgrade);
router.post("/cancel", verifyToken, planController.cancelSubscription);

module.exports = router;
