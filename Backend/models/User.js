const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password in queries by default
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide phone number"],
      unique: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Please select gender"],
    },

    // Role Management
    role: {
      type: String,
      enum: ["student", "contributor", "admin"],
      default: "student",
      required: true,
    },

    // College Information (for students)
    collegeName: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
      required: function () {
        return this.role === "student";
      },
    },
    branch: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 5,
      required: function () {
        return this.role === "student";
      },
    },
    graduationYear: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
    },

    // Verification Status
    emailVerified: {
      type: Boolean,
      default: false,
    },



    // Account Status
    accountStatus: {
      type: String,
      enum: [
        "pending_email_verification",
        "pending_admin_approval",
        "verified",
        "rejected",
        "suspended",
      ],
      default: "pending_email_verification",
    },

    // Profile
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Activity Tracking
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for better query performance (removed duplicates that are already unique:true)
UserSchema.index({ collegeName: 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      accountStatus: this.accountStatus,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// Method to get public profile (without sensitive data)
UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    collegeName: this.collegeName,
    branch: this.branch,
    yearOfStudy: this.yearOfStudy,
    avatar: this.avatar,
    bio: this.bio,
    accountStatus: this.accountStatus,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", UserSchema);
