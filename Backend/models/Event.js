const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [5000, "Description cannot be more than 5000 characters"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "workshop",
        "seminar",
        "hackathon",
        "competition",
        "cultural",
        "sports",
        "fest",
        "webinar",
        "other",
      ],
      required: true,
    },
    visibility: {
      type: String,
      enum: ["campus", "global"],
      default: "campus",
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
    },
    maxParticipants: {
      type: Number,
      default: null, // null means unlimited
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    eventImage: {
      type: String, // URL to uploaded image
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "confirmed", "attended", "cancelled"],
          default: "registered",
        },
      },
    ],
    eventStatus: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventSchema.index({ organizer: 1 });
EventSchema.index({ visibility: 1 });
EventSchema.index({ collegeName: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ eventStatus: 1 });
EventSchema.index({ eventType: 1 });

// Validate end date is after start date
EventSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  if (this.registrationDeadline >= this.startDate) {
    next(new Error("Registration deadline must be before event start date"));
  }
  this.currentParticipants = this.participants.length;
  next();
});

module.exports = mongoose.model("Event", EventSchema);
