const User = require("../models/User");
const crypto = require("crypto");

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      collegeName,
      studentId,
      branch,
      yearOfStudy,
      graduationYear,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phoneNumber || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }, { studentId }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered",
        });
      }
      if (existingUser.studentId === studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID already registered",
        });
      }
    }

    // Validate college email domain
    const verifiedDomains = ["@gnu.ac.in", "@mitindia.edu", "@iitd.ac.in"];
    const isValidDomain = verifiedDomains.some((domain) =>
      email.toLowerCase().endsWith(domain)
    );

    if (!isValidDomain) {
      return res.status(400).json({
        success: false,
        message: "Please use your official college email address",
      });
    }

    // Handle file uploads
    let studentIdCardUrl = null;
    let collegeIdCardUrl = null;

    if (req.files) {
      if (req.files.studentIdCard) {
        studentIdCardUrl = req.files.studentIdCard[0].path;
      }
      if (req.files.collegeIdCard) {
        collegeIdCardUrl = req.files.collegeIdCard[0].path;
      }
    }

    if (!studentIdCardUrl) {
      return res.status(400).json({
        success: false,
        message: "Student ID card is required",
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      collegeName,
      studentId,
      branch,
      yearOfStudy,
      graduationYear,
      studentIdCardUrl,
      collegeIdCardUrl,
      emailVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      role: "student",
      accountStatus: "pending_email_verification",
    });

    // TODO: Send verification email
    // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    // await sendEmail({ to: email, subject: "Verify Email", html: verificationUrl });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      data: {
        user: user.toPublicJSON(),
        verificationToken: emailVerificationToken, // Remove in production
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        accountStatus: user.accountStatus,
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.accountStatus = "pending_admin_approval";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Your account will be reviewed by our team.",
      data: {
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // TODO: Send reset email
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
      resetToken, // Remove in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};
