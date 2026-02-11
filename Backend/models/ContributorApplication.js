const mongoose = require("mongoose");

const ContributorApplicationSchema = new mongoose.Schema(
  {
    // Applicant Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true, // One application per user
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"],
    },
    
    // College Information
    collegeName: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    yearOfStudy: {
      type: Number,
      required: [true, "Year of study is required"],
      min: 1,
      max: 5,
    },
    
    // Additional Details
    reasonForApplying: {
      type: String,
      required: [true, "Reason for applying is required"],
      maxlength: [1000, "Reason cannot exceed 1000 characters"],
    },
    experience: {
      type: String,
      maxlength: [1000, "Experience cannot exceed 1000 characters"],
    },
    
    // Document Uploads
    collegeIdCard: {
      type: String,
      required: [true, "College ID card image is required"],
    },
    authorityLetter: {
      type: String,
      required: [true, "Authority letter is required"],
    },
    
    // Application Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    
    // Admin Review
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    adminComments: {
      type: String,
      maxlength: [500, "Comments cannot exceed 500 characters"],
    },
    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ContributorApplicationSchema.index({ userId: 1 });
ContributorApplicationSchema.index({ collegeName: 1 });
ContributorApplicationSchema.index({ status: 1 });
ContributorApplicationSchema.index({ createdAt: -1 });

// Check if college already has an approved contributor before approval
ContributorApplicationSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    // Check if another contributor exists for this college
    const User = mongoose.model('User');
    const existingContributor = await User.findOne({
      collegeName: this.collegeName,
      role: 'contributor',
      accountStatus: 'verified',
      _id: { $ne: this.userId }
    });
    
    if (existingContributor) {
      throw new Error(`A contributor already exists for ${this.collegeName}`);
    }
  }
  next();
});

module.exports = mongoose.model("ContributorApplication", ContributorApplicationSchema);
