const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const {
      category,
      scope, // 'campus' or 'global'
      college,
      mode, // 'online' or 'offline'
      search,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category && category !== "all") {
      query.eventType = category;
    }

    // Scope filter (campus/global)
    if (scope === "campus" && req.user) {
      query.collegeName = req.user.collegeName;
      query.visibility = "campus";
    } else if (scope === "global") {
      query.visibility = "global";
    }

    // College filter
    if (college && college !== "all") {
      query.collegeName = new RegExp(college, "i");
    }

    // Mode filter (online/offline)
    if (mode === "online") {
      query.isOnline = true;
    } else if (mode === "offline") {
      query.isOnline = false;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { collegeName: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }

    // Date filter - only upcoming and ongoing events
    // Use $and to combine with search $or without overwriting it
    query.endDate = { $gte: new Date() };

    // Sorting
    let sortOption = {};
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "starting-soon") {
      sortOption = { startDate: 1 };
    } else if (sort === "popular") {
      sortOption = { currentParticipants: -1 };
    } else {
      sortOption = { startDate: 1 }; // Default: starting soon
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const events = await Event.find(query)
      .populate("organizer", "fullName email collegeName")
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    // Add status to each event
    const eventsWithStatus = events.map((event) => {
      const now = new Date();
      let status = "upcoming";
      
      if (now >= event.startDate && now <= event.endDate) {
        status = "ongoing";
      } else if (now > event.endDate) {
        status = "completed";
      }

      return {
        ...event.toObject(),
        status,
        isFull: event.maxParticipants && event.currentParticipants >= event.maxParticipants,
      };
    });

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: eventsWithStatus,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "fullName email collegeName avatar")
      .populate("participants.user", "fullName email collegeName");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Add status
    const now = new Date();
    let status = "upcoming";
    
    if (now >= event.startDate && now <= event.endDate) {
      status = "ongoing";
    } else if (now > event.endDate) {
      status = "completed";
    }

    res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        status,
        isFull: event.maxParticipants && event.currentParticipants >= event.maxParticipants,
      },
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event details",
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Contributors & Admins only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      visibility,
      venue,
      isOnline,
      meetingLink,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      registrationFee,
      tags,
      faqs,
    } = req.body;

    // Validate required fields
    if (!title || !description || !eventType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Handle banner image if uploaded via multer
    const eventImage = req.file ? req.file.path : null;

    // Parse tags/faqs if they were sent as JSON strings (FormData)
    let parsedTags = tags;
    if (typeof tags === "string") {
      try { parsedTags = JSON.parse(tags); } catch { parsedTags = []; }
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      organizer: req.user._id,
      eventType,
      visibility: visibility || "campus",
      collegeName: req.user.collegeName,
      venue: venue || (isOnline ? "Online" : ""),
      isOnline: isOnline || false,
      meetingLink: meetingLink || "",
      startDate,
      endDate,
      registrationDeadline: registrationDeadline || startDate,
      maxParticipants: maxParticipants || null,
      registrationFee: registrationFee || 0,
      eventImage,
      tags: parsedTags || [],
    });

    const populatedEvent = await Event.findById(event._id).populate(
      "organizer",
      "fullName email collegeName"
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: populatedEvent,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating event",
    });
  }
};

// @desc    Get trending events
// @route   GET /api/events/trending
// @access  Public
exports.getTrendingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isActive: true,
      endDate: { $gte: new Date() },
    })
      .populate("organizer", "fullName collegeName")
      .sort({ currentParticipants: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trending events",
    });
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if registration is still open
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    // Check if event is full
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Check if already registered
    const alreadyRegistered = event.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Add participant
    event.participants.push({
      user: req.user._id,
      registeredAt: Date.now(),
    });

    // currentParticipants is auto-synced by pre-save hook from participants.length
    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered for event",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering for event",
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Public
exports.getEventStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEvents = await Event.countDocuments({ isActive: true });
    const eventsToday = await Event.countDocuments({
      isActive: true,
      startDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });
    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      startDate: { $gt: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        eventsToday,
        upcomingEvents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event statistics",
    });
  }
};
