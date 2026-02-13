const User = require("../models/User");
const Event = require("../models/Event");
const Post = require("../models/Post");
const ContributorApplication = require("../models/ContributorApplication");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // User stats
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalContributors = await User.countDocuments({ role: "contributor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const verifiedUsers = await User.countDocuments({ accountStatus: "verified" });
    const pendingUsers = await User.countDocuments({ accountStatus: "pending_email_verification" });
    const suspendedUsers = await User.countDocuments({ accountStatus: "suspended" });

    // Event stats
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      startDate: { $gt: now },
    });
    const ongoingEvents = await Event.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Post stats
    const totalPosts = await Post.countDocuments();
    const activePosts = await Post.countDocuments({ isActive: true });
    const reportedPosts = await Post.countDocuments({
      "reportedBy.0": { $exists: true },
    });

    // Application stats
    const totalApplications = await ContributorApplication.countDocuments();
    const pendingApplications = await ContributorApplication.countDocuments({ status: "pending" });
    const approvedApplications = await ContributorApplication.countDocuments({ status: "approved" });
    const rejectedApplications = await ContributorApplication.countDocuments({ status: "rejected" });

    // Recent activity (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const newEventsThisWeek = await Event.countDocuments({ createdAt: { $gte: weekAgo } });
    const newPostsThisWeek = await Post.countDocuments({ createdAt: { $gte: weekAgo } });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          contributors: totalContributors,
          admins: totalAdmins,
          verified: verifiedUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
        },
        events: {
          total: totalEvents,
          active: activeEvents,
          upcoming: upcomingEvents,
          ongoing: ongoingEvents,
        },
        posts: {
          total: totalPosts,
          active: activePosts,
          reported: reportedPosts,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        recentActivity: {
          newUsers: newUsersThisWeek,
          newEvents: newEventsThisWeek,
          newPosts: newPostsThisWeek,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

// @desc    Get all users with filters (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const {
      role,
      accountStatus,
      collegeName,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (accountStatus && accountStatus !== "all") filter.accountStatus = accountStatus;
    if (collegeName) filter.collegeName = new RegExp(collegeName, "i");
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { studentId: new RegExp(search, "i") },
        { collegeName: new RegExp(search, "i") },
      ];
    }

    let sortOption = {};
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name") sortOption = { fullName: 1 };
    else sortOption = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select("-password -emailOTP -emailOTPExpire -resetPasswordToken -resetPasswordExpire")
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// @desc    Update user role/status (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from modifying their own role
    if (user._id.toString() === req.user.id && req.body.role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // Only one admin (developer) exists — prevent promoting anyone to admin
    if (req.body.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot promote users to admin. Only one developer admin is allowed.",
      });
    }

    // Prevent modifying the admin user
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot modify the admin account",
      });
    }

    const allowedFields = ["role", "accountStatus", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // If setting email verified status
    if (req.body.accountStatus === "verified") {
      user.emailVerified = true;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -emailOTP -emailOTPExpire"
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account from admin panel",
      });
    }

    // Prevent deleting other admins
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin accounts from this panel",
      });
    }

    // Delete associated data
    await Post.deleteMany({ author: user._id });
    await Event.deleteMany({ organizer: user._id });
    await ContributorApplication.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// @desc    Get all events for admin
// @route   GET /api/admin/events
// @access  Private (Admin only)
exports.getAllEvents = async (req, res) => {
  try {
    const {
      eventType,
      visibility,
      collegeName,
      search,
      isActive,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (eventType && eventType !== "all") filter.eventType = eventType;
    if (visibility && visibility !== "all") filter.visibility = visibility;
    if (collegeName) filter.collegeName = new RegExp(collegeName, "i");
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { collegeName: new RegExp(search, "i") },
      ];
    }

    let sortOption = {};
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "popular") sortOption = { currentParticipants: -1 };
    else sortOption = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const events = await Event.find(filter)
      .populate("organizer", "fullName email collegeName")
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: events,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

// @desc    Toggle event active status (Admin)
// @route   PUT /api/admin/events/:id/toggle
// @access  Private (Admin only)
exports.toggleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${event.isActive ? "activated" : "deactivated"} successfully`,
      data: event,
    });
  } catch (error) {
    console.error("Toggle event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle event",
    });
  }
};

// @desc    Delete event (Admin)
// @route   DELETE /api/admin/events/:id
// @access  Private (Admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

// @desc    Get all posts for admin
// @route   GET /api/admin/posts
// @access  Private (Admin only)
exports.getAllPosts = async (req, res) => {
  try {
    const {
      visibility,
      search,
      reported,
      isActive,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (visibility && visibility !== "all") filter.visibility = visibility;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (reported === "true") {
      filter["reportedBy.0"] = { $exists: true };
    }
    if (search) {
      filter.$or = [{ content: new RegExp(search, "i") }];
    }

    let sortOption = {};
    if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "most-liked") sortOption = { likesCount: -1 };
    else if (sort === "most-reported") sortOption = { reportedByCount: -1 };
    else sortOption = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .populate("author", "fullName email collegeName avatar role")
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: posts,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// @desc    Toggle post active status (Admin)
// @route   PUT /api/admin/posts/:id/toggle
// @access  Private (Admin only)
exports.togglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.isActive = !post.isActive;
    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${post.isActive ? "activated" : "hidden"} successfully`,
      data: post,
    });
  } catch (error) {
    console.error("Toggle post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle post",
    });
  }
};

// @desc    Delete post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private (Admin only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

// @desc    Dismiss reports on a post (Admin)
// @route   PUT /api/admin/posts/:id/dismiss-reports
// @access  Private (Admin only)
exports.dismissReports = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.reportedBy = [];
    await post.save();

    res.status(200).json({
      success: true,
      message: "Reports dismissed successfully",
      data: post,
    });
  } catch (error) {
    console.error("Dismiss reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to dismiss reports",
    });
  }
};

// @desc    Verify user manually (Admin)
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.accountStatus = "verified";
    user.emailVerified = true;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -emailOTP -emailOTPExpire"
    );

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify user",
    });
  }
};

// @desc    Suspend user (Admin)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot suspend your own account",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot suspend admin accounts",
      });
    }

    user.accountStatus = "suspended";
    user.isActive = false;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -emailOTP -emailOTPExpire"
    );

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to suspend user",
    });
  }
};
