const ContributorApplication = require("../models/ContributorApplication");
const User = require("../models/User");

// @desc    Submit contributor application
// @route   POST /api/contributor/apply
// @access  Private (Student only)
exports.submitApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is a student
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can apply to become contributors",
      });
    }
    
    // Check if user already submitted an application
    const existingApplication = await ContributorApplication.findOne({ userId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted an application",
        application: existingApplication,
      });
    }
    
    // Check if college already has an approved contributor
    const existingContributor = await User.findOne({
      collegeName: user.collegeName,
      role: "contributor",
      accountStatus: "verified",
    });
    
    if (existingContributor) {
      return res.status(400).json({
        success: false,
        message: `Your college (${user.collegeName}) already has a contributor. Only one contributor per college is allowed.`,
      });
    }
    
    // Validate file uploads
    if (!req.files || !req.files.collegeIdCard || !req.files.authorityLetter) {
      return res.status(400).json({
        success: false,
        message: "Please upload both College ID card and Authority letter",
      });
    }
    
    const { reasonForApplying, experience } = req.body;
    
    // Create application
    const application = await ContributorApplication.create({
      userId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      collegeName: user.collegeName,
      studentId: user.studentId,
      branch: user.branch,
      yearOfStudy: user.yearOfStudy,
      reasonForApplying,
      experience,
      collegeIdCard: req.files.collegeIdCard[0].path,
      authorityLetter: req.files.authorityLetter[0].path,
    });
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully. Please wait for admin approval.",
      application,
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit application",
    });
  }
};

// @desc    Get user's application status
// @route   GET /api/contributor/my-application
// @access  Private (Student only)
exports.getMyApplication = async (req, res) => {
  try {
    const application = await ContributorApplication.findOne({
      userId: req.user.id,
    }).populate("reviewedBy", "fullName email");
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found",
      });
    }
    
    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/contributor/applications
// @access  Private (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const { status, collegeName, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (collegeName) filter.collegeName = new RegExp(collegeName, "i");
    
    const applications = await ContributorApplication.find(filter)
      .populate("userId", "fullName email accountStatus")
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ContributorApplication.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// @desc    Get single application details (Admin only)
// @route   GET /api/contributor/applications/:id
// @access  Private (Admin only)
exports.getApplicationById = async (req, res) => {
  try {
    const application = await ContributorApplication.findById(req.params.id)
      .populate("userId", "fullName email phoneNumber accountStatus")
      .populate("reviewedBy", "fullName email");
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    
    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

// @desc    Approve contributor application
// @route   PUT /api/contributor/applications/:id/approve
// @access  Private (Admin only)
exports.approveApplication = async (req, res) => {
  try {
    const application = await ContributorApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application already ${application.status}`,
      });
    }
    
    // Check if college already has a contributor
    const existingContributor = await User.findOne({
      collegeName: application.collegeName,
      role: "contributor",
      accountStatus: "verified",
    });
    
    if (existingContributor) {
      return res.status(400).json({
        success: false,
        message: `College ${application.collegeName} already has a contributor`,
      });
    }
    
    // Update application status
    application.status = "approved";
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    application.adminComments = req.body.comments || "";
    await application.save();
    
    // Update user role to contributor
    const user = await User.findById(application.userId);
    user.role = "contributor";
    user.accountStatus = "verified";
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      application,
    });
  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve application",
    });
  }
};

// @desc    Reject contributor application
// @route   PUT /api/contributor/applications/:id/reject
// @access  Private (Admin only)
exports.rejectApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }
    
    const application = await ContributorApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application already ${application.status}`,
      });
    }
    
    // Update application status
    application.status = "rejected";
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();
    application.rejectionReason = rejectionReason;
    application.adminComments = req.body.comments || "";
    await application.save();
    
    res.status(200).json({
      success: true,
      message: "Application rejected",
      application,
    });
  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
    });
  }
};

// @desc    Delete application (Admin only)
// @route   DELETE /api/contributor/applications/:id
// @access  Private (Admin only)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await ContributorApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    
    await application.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
    });
  }
};
