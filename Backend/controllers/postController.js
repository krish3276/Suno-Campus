const Post = require("../models/Post");
const User = require("../models/User");

// @desc    Get posts (campus/global)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { scope = "campus", search, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (scope === "campus" && req.user) {
      filter.visibility = "campus";
    } else if (scope === "global") {
      filter.visibility = "global";
    }

    if (search) {
      filter.$or = [{ content: new RegExp(search, "i") }];
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .populate("author", "fullName email collegeName avatar role")
      .populate("comments.user", "fullName avatar")
      .sort({ createdAt: -1 })
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
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "fullName email collegeName avatar role")
      .populate("comments.user", "fullName avatar");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
    });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private (Contributors & Admins)
exports.createPost = async (req, res) => {
  try {
    const { content, visibility, image } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      content,
      author: req.user._id,
      visibility: visibility || "campus",
      image: image || null,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "fullName email collegeName avatar role"
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
    });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this post",
      });
    }

    post.likes.push(req.user._id);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post liked",
      data: { likesCount: post.likesCount },
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like post",
    });
  }
};

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post unliked",
      data: { likesCount: post.likesCount },
    });
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlike post",
    });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.user",
      "fullName avatar"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post.comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user._id,
      content,
    });

    await post.save();

    // Return the newly added comment populated
    const updatedPost = await Post.findById(post._id).populate(
      "comments.user",
      "fullName avatar"
    );

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: updatedPost.comments[updatedPost.comments.length - 1],
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

// @desc    Delete a post (owner or admin)
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership or admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
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

// @desc    Report a post
// @route   POST /api/posts/:id/report
// @access  Private
exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if already reported by this user
    const alreadyReported = post.reportedBy.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this post",
      });
    }

    post.reportedBy.push({
      user: req.user._id,
      reason: reason || "Inappropriate content",
    });

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post reported successfully",
    });
  } catch (error) {
    console.error("Report post error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report post",
    });
  }
};

// @desc    Get posts by current user
// @route   GET /api/posts/my-posts
// @access  Private
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate("author", "fullName email collegeName avatar role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your posts",
    });
  }
};
