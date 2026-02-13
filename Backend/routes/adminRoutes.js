const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  verifyUser,
  suspendUser,
  getAllEvents,
  toggleEvent,
  deleteEvent,
  getAllPosts,
  togglePost,
  deletePost,
  dismissReports,
} = require("../controllers/adminController");

// All routes require admin auth
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/suspend", suspendUser);

// Event management
router.get("/events", getAllEvents);
router.put("/events/:id/toggle", toggleEvent);
router.delete("/events/:id", deleteEvent);

// Post management
router.get("/posts", getAllPosts);
router.put("/posts/:id/toggle", togglePost);
router.delete("/posts/:id", deletePost);
router.put("/posts/:id/dismiss-reports", dismissReports);

module.exports = router;
