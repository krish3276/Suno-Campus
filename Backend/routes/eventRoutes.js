const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  getEvents,
  getEventById,
  createEvent,
  getTrendingEvents,
  registerForEvent,
  getEventStats,
} = require("../controllers/eventController");

// Public routes
router.get("/", getEvents);
router.get("/trending", getTrendingEvents);
router.get("/stats", getEventStats);
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, authorize("contributor", "admin"), createEvent);
router.post("/:id/register", protect, registerForEvent);

module.exports = router;
