const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
  getUserById,
  updateUserById,
  getAllUsers,
} = require("../controllers/profileController");

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG, GIF) are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
});

// User routes (authenticated users can access their own profile)
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/", protect, deleteAccount);

// Admin routes (manage other users)
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/user/:id", protect, authorize("admin"), getUserById);
router.put("/user/:id", protect, authorize("admin"), updateUserById);

module.exports = router;
