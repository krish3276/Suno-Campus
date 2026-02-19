const express = require("express");
const multer = require("multer");
const path = require("path");
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

// Configure multer for event banner uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "event-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Public routes
router.get("/", getEvents);
router.get("/trending", getTrendingEvents);
router.get("/stats", getEventStats);
router.get("/:id", getEventById);

// Protected routes
router.post("/", protect, authorize("contributor", "admin"), upload.single("eventImage"), createEvent);
router.post("/:id/register", protect, registerForEvent);

module.exports = router;
