const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user.id).select("-password -emailOTP -emailOTPExpire");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      "fullName",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "bio",
      "avatar",
      "branch",
      "yearOfStudy",
    ];

    // Restricted fields that cannot be updated
    const restrictedFields = ["email", "studentId", "collegeName", "role", "accountStatus"];
    
    // Check if user is trying to modify restricted fields
    const attemptedRestrictedUpdates = restrictedFields.filter(field => req.body[field] !== undefined);
    if (attemptedRestrictedUpdates.length > 0) {
      return res.status(403).json({
        success: false,
        message: `Cannot modify restricted fields: ${attemptedRestrictedUpdates.join(", ")}`,
      });
    }

    // Update only allowed fields
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user.id).select("-password -emailOTP -emailOTPExpire");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// @desc    Upload profile avatar
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update avatar path
    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/profile
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your password to confirm account deletion",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Instead of deleting, deactivate the account
    user.isActive = false;
    user.accountStatus = "suspended";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
    });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/profile/user/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -emailOTP -emailOTPExpire");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// @desc    Update user by ID (Admin only)
// @route   PUT /api/profile/user/:id
// @access  Private (Admin)
exports.updateUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin can update more fields including role and status
    // But cannot promote anyone to admin — only one developer admin exists
    if (req.body.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot promote users to admin. Only one developer admin is allowed.",
      });
    }

    const allowedAdminUpdates = [
      "fullName",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "bio",
      "avatar",
      "branch",
      "yearOfStudy",
      "role",
      "accountStatus",
      "isActive",
    ];

    // Password cannot be updated this way
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Use password reset feature to change password",
      });
    }

    // Update allowed fields
    allowedAdminUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const updatedUser = await User.findById(user.id).select("-password -emailOTP -emailOTPExpire");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user by ID error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/profile/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, accountStatus, collegeName, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (accountStatus) filter.accountStatus = accountStatus;
    if (collegeName) filter.collegeName = new RegExp(collegeName, "i");
    
    const users = await User.find(filter)
      .select("-password -emailOTP -emailOTPExpire")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
