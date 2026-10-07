const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const Appointment = require("../models/Appointment.model");
const Client = require("../models/Client.model");
const User = require("../models/User.model");
const ServiceProvider = require("../models/ServiceProvider.model");
const Review = require("../models/Review.model");
const Notification = require("../models/Notification.model");


router.use(requireAuth);
router.use(requireRole("client"));

// ── GET /api/client/dashboard ─────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const client = await Client.findOne({ user: userId });
    if (!client)
      return res.status(404).json({ message: "Client profile not found." });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBooked,
      completed,
      cancelled,
      upcomingList,
      recentNotifications,
      unreadNotifications,
    ] = await Promise.all([
      Appointment.countDocuments({ user: userId }),
      Appointment.countDocuments({ user: userId, status: "completed" }),
      Appointment.countDocuments({ user: userId, status: "cancelled" }),
      Appointment.find({
        user: userId,
        status: { $in: ["confirmed", "pending"] },
        date: { $gte: today },
      })
        .populate("provider", "name serviceName address")
        .sort({ date: 1, timeSlot: 1 })
        .limit(10),
      Notification.find({
        recipient: userId,
        recipientRole: "client",
      })
        .sort({ createdAt: -1 })
        .limit(5),
      Notification.countDocuments({
        recipient: userId,
        recipientRole: "client",
        read: false,
      }),
    ]);

    const upcoming = upcomingList.length;

    const formatApt = (apt) => ({
      id: apt._id,
      initials:
        apt.provider?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("") || "?",
      service: apt.service,
      provider: apt.provider?.name || "Unknown",
      date: apt.date?.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: apt.timeSlot,
      status: apt.status,
      month: apt.date?.toLocaleDateString("en-US", { month: "short" }),
      day: apt.date?.getDate().toString(),
    });

    res.json({
      stats: { totalBooked, completed, upcoming, cancelled },
      nextAppointment:
        upcomingList.length > 0 ? formatApt(upcomingList[0]) : null,
      upcomingAppointments: upcomingList.map(formatApt),
      notifications: recentNotifications.map((n) => ({
        id: n._id,
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        unread: !n.read,
        appointment: n.appointment,
        createdAt: n.createdAt,
      })),
      unreadNotifications,
    });
  } catch (err) {
    console.error("Client dashboard error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/client/profile ───────────────────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const client = await Client.findOne({ user: req.auth.userId });
    if (!client) return res.status(404).json({ message: "Profile not found." });

    const user = await User.findById(req.auth.userId).select("email");

    const nameParts = (client.name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    res.json({
      firstName,
      lastName,
      email: user?.email || "",
      phone: client.phone || "",
      address: client.address || "",
      profileImage: client.profileImage || "",
      notificationPrefs: client.notificationPrefs || {
        emailReminders: true,
        smsReminders: false,
        pushNotifications: true,
      },
    });
  } catch (err) {
    console.error("Get client profile error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── PUT /api/client/profile ───────────────────────────────────────────
router.put("/profile", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      notificationPrefs,
      profileImage,
    } = req.body;

    const name = `${firstName} ${lastName}`.trim();

    const updateFields = {
      name,
      phone,
      address,
      ...(notificationPrefs && { notificationPrefs }),
      // only update profileImage when the field is explicitly sent
      ...(profileImage !== undefined && { profileImage }),
    };

    const client = await Client.findOneAndUpdate(
      { user: req.auth.userId },
      updateFields,
      { new: true },
    );

    if (!client) return res.status(404).json({ message: "Profile not found." });

    if (name) {
      await User.findByIdAndUpdate(req.auth.userId, { name });
    }

    res.json({
      message: "Profile updated.",
      name,
      profileImage: client.profileImage || "",
    });
  } catch (err) {
    console.error("Update client profile error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});




// ── PUT /api/client/change-password ──────────────────────────────────
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields are required." });

    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });

    const user = await User.findById(req.auth.userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/client/appointments ─────────────────────────────────────
router.get("/appointments", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { status, search } = req.query;

    const query = { user: userId };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (status && status !== "all") {
      if (status === "upcoming") {
        query.status = { $in: ["confirmed", "pending"] };
        query.date = { $gte: today };
      } else {
        query.status = status;
      }
    }

    const appointments = await Appointment.find(query)
      .populate("provider", "name profession serviceName address profileImage phone rating reviewCount")
      .sort({ date: -1, timeSlot: -1 });

    const aptIds = appointments.map((a) => a._id);
    const reviews = await Review.find({ appointment: { $in: aptIds } });
    const reviewMap = new Map(reviews.map((r) => [r.appointment.toString(), r]));

    const formatted = appointments.map((apt) => ({
      id: apt._id,
      service: apt.service,
      date: apt.date,
      dateFormatted: apt.date?.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      timeSlot: apt.timeSlot,
      duration: apt.duration,
      status: apt.status,
      notes: apt.notes,
      provider: apt.provider
        ? {
            id: apt.provider._id,
            name: apt.provider.name,
            profession: apt.provider.profession || apt.provider.serviceName,
            address: apt.provider.address,
            profileImage: apt.provider.profileImage,
            phone: apt.provider.phone,
            rating: apt.provider.rating,
          }
        : null,
      review: reviewMap.get(apt._id.toString()) || null,
    }));

    const filtered = search
      ? formatted.filter(
          (a) =>
            a.service?.toLowerCase().includes(search.toLowerCase()) ||
            a.provider?.name?.toLowerCase().includes(search.toLowerCase()),
        )
      : formatted;

    res.json({ appointments: filtered });
  } catch (err) {
    console.error("Get client appointments error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/client/appointments/:id ─────────────────────────────────
router.get("/appointments/:id", async (req, res) => {
  try {
    const apt = await Appointment.findOne({
      _id: req.params.id,
      user: req.auth.userId,
    }).populate("provider", "name profession serviceName address profileImage phone rating reviewCount user");

    if (!apt) return res.status(404).json({ message: "Appointment not found." });

    const review = await Review.findOne({ appointment: apt._id });

    res.json({
      appointment: {
        id: apt._id,
        service: apt.service,
        date: apt.date,
        dateFormatted: apt.date?.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        timeSlot: apt.timeSlot,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes,
        createdAt: apt.createdAt,
        provider: apt.provider,
        review,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/client/appointments/:id/cancel ────────────────────────
router.patch("/appointments/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;
    const apt = await Appointment.findOne({
      _id: req.params.id,
      user: req.auth.userId,
    }).populate("provider");

    if (!apt) return res.status(404).json({ message: "Appointment not found." });
    if (apt.status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled." });
    }

    apt.status = "cancelled";
    if (reason) apt.notes = `${apt.notes ? apt.notes + " | " : ""}Cancelled by client: ${reason}`;
    await apt.save();

    if (apt.provider?.user) {
      await Notification.create({
        recipient: apt.provider.user,
        recipientRole: "provider",
        title: "Appointment Cancelled",
        message: `Client cancelled the appointment for ${apt.service} scheduled on ${apt.timeSlot}.`,
        type: "booking_cancelled",
        appointment: apt._id,
      });
    }

    await Notification.create({
      recipient: req.auth.userId,
      recipientRole: "client",
      title: "Appointment Cancelled",
      message: `You cancelled your appointment for ${apt.service} scheduled on ${apt.timeSlot}.`,
      type: "booking_cancelled",
      appointment: apt._id,
    });

    res.json({ message: "Appointment cancelled successfully.", appointment: apt });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/client/appointments/:id/reschedule ────────────────────
router.patch("/appointments/:id/reschedule", async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    if (!date || !timeSlot) {
      return res.status(400).json({ message: "New date and timeSlot are required." });
    }

    const apt = await Appointment.findOne({
      _id: req.params.id,
      user: req.auth.userId,
    }).populate("provider");

    if (!apt) return res.status(404).json({ message: "Appointment not found." });

    const [yr, mo, dy] = date.split("-").map(Number);
    const startOfDay = new Date(yr, mo - 1, dy, 0, 0, 0, 0);
    const endOfDay = new Date(yr, mo - 1, dy, 23, 59, 59, 999);

    const collision = await Appointment.findOne({
      provider: apt.provider._id,
      _id: { $ne: apt._id },
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (collision) {
      return res.status(409).json({ message: "This slot is already booked. Please choose another." });
    }

    apt.date = new Date(yr, mo - 1, dy);
    apt.timeSlot = timeSlot;
    apt.status = "pending";
    await apt.save();

    if (apt.provider?.user) {
      await Notification.create({
        recipient: apt.provider.user,
        recipientRole: "provider",
        title: "Appointment Rescheduled",
        message: `Client requested reschedule for ${apt.service} to ${new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeSlot}.`,
        type: "booking_rescheduled",
        appointment: apt._id,
      });
    }

    await Notification.create({
      recipient: req.auth.userId,
      recipientRole: "client",
      title: "Appointment Rescheduled",
      message: `You rescheduled your appointment for ${apt.service} to ${new Date(yr, mo - 1, dy).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeSlot}.`,
      type: "booking_rescheduled",
      appointment: apt._id,
    });

    res.json({ message: "Appointment rescheduled successfully.", appointment: apt });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/client/reviews ─────────────────────────────────────────
router.post("/reviews", async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const userId = req.auth.userId;

    if (!appointmentId || !rating) {
      return res.status(400).json({ message: "Appointment and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const apt = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    }).populate("provider");

    if (!apt) return res.status(404).json({ message: "Appointment not found." });
    if (apt.status !== "completed") {
      return res.status(400).json({ message: "Only completed appointments can be reviewed." });
    }

    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this appointment." });
    }

    const review = await Review.create({
      client: userId,
      provider: apt.provider._id,
      appointment: apt._id,
      rating,
      comment: comment || "",
      service: apt.service,
    });

    const allReviews = await Review.find({ provider: apt.provider._id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ServiceProvider.findByIdAndUpdate(apt.provider._id, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    if (apt.provider?.user) {
      await Notification.create({
        recipient: apt.provider.user,
        recipientRole: "provider",
        title: "New Review Received",
        message: `You received a ${rating}★ review for ${apt.service}.`,
        type: "review_received",
        appointment: apt._id,
      });
    }

    res.status(201).json({ message: "Review submitted successfully.", review });
  } catch (err) {
    console.error("Submit review error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/client/notifications ────────────────────────────────────
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.auth.userId,
      recipientRole: "client",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.auth.userId,
      recipientRole: "client",
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/client/notifications/read-all ──────────────────────────
router.patch("/notifications/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.auth.userId, recipientRole: "client", read: false },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/client/notifications/:id/read ─────────────────────────
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.auth.userId },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── DELETE /api/client/notifications/:id ───────────────────────────
router.delete("/notifications/:id", async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.auth.userId,
      recipientRole: "client",
    });
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json({ success: true, message: "Notification deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── DELETE /api/client/notifications/clear-all ──────────────────────
router.delete("/notifications/clear-all", async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.auth.userId,
      recipientRole: "client",
    });
    res.json({ success: true, message: "All notifications cleared." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

