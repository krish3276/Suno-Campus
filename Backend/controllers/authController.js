const User = require("../models/User");
const crypto = require("crypto");
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } = require("../services/emailService");

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

    // Create user with pending email verification status
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
      role: "student",
      accountStatus: "pending_email_verification",
      emailVerified: false,
    });

    // Generate OTP
    const otp = user.generateEmailOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, fullName);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails - OTP is still in database
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your college email for the OTP to verify your account.",
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        otpSent: true,
        expiresIn: "10 minutes",
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

    // Check account status - only verified users can login
    if (user.accountStatus !== 'verified') {
      let message = "Your account is not yet verified";
      
      if (user.accountStatus === 'pending_email_verification') {
        message = "Please verify your email before logging in";
      } else if (user.accountStatus === 'pending_admin_approval') {
        message = "Your account is pending admin approval";
      } else if (user.accountStatus === 'rejected') {
        message = "Your account application was rejected";
      } else if (user.accountStatus === 'suspended') {
        message = "Your account has been suspended";
      }
      
      return res.status(403).json({
        success: false,
        message,
        data: {
          user: user.toPublicJSON(),
        },
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
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.fullName);
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
      // Clear reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
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

// @desc    Verify email OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    // Find user and include OTP fields
    const user = await User.findOne({ email })
      .select("+emailOTP +emailOTPExpire");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. You can login now.",
      });
    }

    // Verify OTP
    const isOTPValid = user.verifyEmailOTP(otp);

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // Update user status
    user.emailVerified = true;
    user.accountStatus = "verified"; // Auto-verify for college emails
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
      // Don't fail the verification if welcome email fails
    }

    // Generate token for immediate login
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
      data: {
        token,
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email address",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. You can login now.",
      });
    }

    // Generate new OTP
    const otp = user.generateEmailOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.fullName);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP has been resent to your email",
      data: {
        email: user.email,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Error resending OTP",
    });
  }
};
