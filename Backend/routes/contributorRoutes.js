const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  submitApplication,
  getMyApplication,
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  deleteApplication,
} = require("../controllers/contributorController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/contributor-applications/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs only
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (JPEG, JPG, PNG) and PDF files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Student routes
router.post(
  "/apply",
  protect,
  authorize("student"),
  upload.fields([
    { name: "collegeIdCard", maxCount: 1 },
    { name: "authorityLetter", maxCount: 1 },
  ]),
  submitApplication
);

router.get("/my-application", protect, authorize("student"), getMyApplication);

// Admin routes
router.get("/applications", protect, authorize("admin"), getAllApplications);
router.get("/applications/:id", protect, authorize("admin"), getApplicationById);
router.put("/applications/:id/approve", protect, authorize("admin"), approveApplication);
router.put("/applications/:id/reject", protect, authorize("admin"), rejectApplication);
router.delete("/applications/:id", protect, authorize("admin"), deleteApplication);

module.exports = router;
