const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes (require authentication)
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
