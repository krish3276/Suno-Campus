const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  getPosts,
  getPostById,
  createPost,
  likePost,
  unlikePost,
  getComments,
  addComment,
  deletePost,
  reportPost,
  getMyPosts,
} = require("../controllers/postController");

// Public routes
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/:id/comments", getComments);

// Protected routes
router.post("/", protect, authorize("contributor", "admin"), createPost);
router.get("/user/my-posts", protect, getMyPosts);
router.post("/:id/like", protect, likePost);
router.post("/:id/unlike", protect, unlikePost);
router.post("/:id/comments", protect, addComment);
router.post("/:id/report", protect, reportPost);
router.delete("/:id", protect, deletePost);

module.exports = router;
