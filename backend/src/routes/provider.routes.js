const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const Appointment = require("../models/Appointment.model");
const ServiceProvider = require("../models/ServiceProvider.model");
const User = require("../models/User.model");
const Client = require("../models/Client.model");
const Review = require("../models/Review.model");
const Notification = require("../models/Notification.model");

router.use(requireAuth);
router.use(requireRole("provider"));

// ── GET /api/provider/dashboard ──────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.auth.userId;

    const provider = await ServiceProvider.findOne({ user: userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [
      todayAppointments,
      pendingRequests,
      completed,
      cancelled,
      confirmedToday,
      allPending,
      unreadNotifications,
    ] = await Promise.all([
      Appointment.countDocuments({
        provider: provider._id,
        date: { $gte: today, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        provider: provider._id,
        status: "pending",
      }),
      Appointment.countDocuments({
        provider: provider._id,
        status: "completed",
      }),
      Appointment.countDocuments({
        provider: provider._id,
        status: "cancelled",
      }),
      Appointment.find({
        provider: provider._id,
        status: "confirmed",
        date: { $gte: today, $lt: tomorrow },
      }),
      Appointment.find({
        provider: provider._id,
        status: "pending",
      }).sort({ date: 1 }),
      Notification.countDocuments({
        recipient: userId,
        recipientRole: "provider",
        read: false,
      }),
    ]);

    const userIds = [
      ...allPending.map((a) => a.user),
      ...confirmedToday.map((a) => a.user),
    ].filter(Boolean);
    const clients = await Client.find({ user: { $in: userIds } });
    const clientMap = new Map(clients.map((c) => [c.user.toString(), c]));

    const formatCard = (apt) => {
      const client = clientMap.get(apt.user?.toString());
      const name = client?.name || "Client";
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "C";
      return {
        id: apt._id,
        name,
        initials,
        service: apt.service,
        date: apt.date?.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: apt.timeSlot,
        duration: apt.duration ? `${apt.duration} min` : "N/A",
        status: apt.status,
      };
    };

    res.json({
      stats: {
        todayAppointments,
        pendingRequests,
        completed,
        cancelled,
        averageRating: provider.rating || 0,
        unreadNotifications,
      },
      unreadNotifications,
      isProfileComplete: provider.isProfileComplete || false,
      pendingRequests: allPending.map(formatCard),
      confirmedToday: confirmedToday.map((apt) => {
        const client = clientMap.get(apt.user?.toString());
        const name = client?.name || "Client";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "C";
        return {
          id: apt._id,
          name,
          initials,
          service: apt.service,
          time: apt.timeSlot,
        };
      }),
    });
  } catch (err) {
    console.error("Provider dashboard error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/provider/profile ─────────────────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const user = await User.findById(req.auth.userId).select("email");

    res.json({
      name: provider.name || "",
      phone: provider.phone || "",
      profession: provider.profession || "",
      address: provider.address || "",
      bio: provider.bio || "",
      contactEmail: provider.contactEmail || "",
      email: user?.email || "",
      profileImage: provider.profileImage || "",
      rating: provider.rating || 0,
      reviewCount: provider.reviewCount || 0,
      isAvailable: provider.isAvailable ?? true,
      specializations: provider.specializations || [],
      isProfileComplete: provider.isProfileComplete || false,
      notificationPrefs: provider.notificationPrefs || {
        emailReminders: true,
        smsReminders: false,
        pushNotifications: true,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── PUT /api/provider/profile ─────────────────────────────────────────
router.put("/profile", async (req, res) => {
  try {
    const {
      name,
      phone,
      profession,
      address,
      bio,
      specializations,
      isAvailable,
      notificationPrefs,
      profileImage,
    } = req.body;

    const isProfileComplete = !!(name && phone && profession && address && bio);

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.auth.userId },
      {
        name,
        phone,
        profession,
        address,
        bio,
        ...(profileImage !== undefined && { profileImage }),
        specializations: specializations || [],
        isAvailable: isAvailable ?? true,
        isProfileComplete,
        ...(notificationPrefs && { notificationPrefs }),
      },
      { new: true },
    );

    if (!provider) {
      return res.status(404).json({ message: "Profile not found." });
    }

    if (name) {
      await User.findByIdAndUpdate(req.auth.userId, { name });
    }

    res.json({ message: "Profile updated.", isProfileComplete });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});


// ── POST /api/provider/profile/image ─────────────────────────────────
// Uploads a profile image to Cloudinary and saves the secure URL.
router.post("/profile/image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ message: "A valid image is required." });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        message: "Cloudinary is not configured on the server.",
      });
    }

    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "bookease/profile-images",
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    provider.profileImage = result.secure_url;
    await provider.save();

    res.json({
      message: "Profile picture updated.",
      profileImage: provider.profileImage,
    });
  } catch (err) {
    console.error("Profile image upload error:", err.message);
    res.status(500).json({ message: "Failed to upload profile picture." });
  }
});

// ── PUT /api/provider/change-password ────────────────────────────────
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const user = await User.findById(req.auth.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/provider/availability ───────────────────────────────────
// Returns availability settings + specializations for per-service duration
router.get("/availability", async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found." });
    }

    res.json({
      weeklySchedule: provider.availability?.weeklySchedule || {},
      defaultDuration: provider.availability?.defaultDuration || 30,
      bufferTime: provider.availability?.bufferTime || "None",
      blockedPeriods: provider.availability?.blockedPeriods || [],
      // per-service durations keyed by specialization name
      // e.g. { "Dental Consultation": 15, "Dental Cleaning": 30 }
      serviceDurations: provider.availability?.serviceDurations || {},
      // list of specializations so frontend can render the per-service rows
      specializations: provider.specializations || [],
    });
  } catch (err) {
    console.error("Get availability error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── PUT /api/provider/availability ───────────────────────────────────
router.put("/availability", async (req, res) => {
  try {
    const {
      weeklySchedule,
      defaultDuration,
      bufferTime,
      blockedPeriods,
      serviceDurations, // { "Dental Consultation": 15, "Fitness Training": 60 }
    } = req.body;

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.auth.userId },
      {
        availability: {
          weeklySchedule: weeklySchedule || {},
          defaultDuration: defaultDuration || 30,
          bufferTime: bufferTime || "None",
          blockedPeriods: blockedPeriods || [],
          serviceDurations: serviceDurations || {},
        },
      },
      { new: true },
    );

    if (!provider) {
      return res.status(404).json({ message: "Provider not found." });
    }

    res.json({
      message: "Availability saved.",
      availability: provider.availability,
    });
  } catch (err) {
    console.error("Update availability error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/provider/appointments ───────────────────────────────────
router.get("/appointments", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { status, date } = req.query;

    const provider = await ServiceProvider.findOne({ user: userId });
    if (!provider) return res.status(404).json({ message: "Provider not found." });

    const query = { provider: provider._id };
    if (status && status !== "all") query.status = status;

    if (date) {
      const [yr, mo, dy] = date.split("-").map(Number);
      query.date = {
        $gte: new Date(yr, mo - 1, dy, 0, 0, 0, 0),
        $lte: new Date(yr, mo - 1, dy, 23, 59, 59, 999),
      };
    }

    const appointments = await Appointment.find(query).sort({ date: -1, timeSlot: -1 });

    const userIds = appointments.map((a) => a.user).filter(Boolean);
    const [clients, users] = await Promise.all([
      Client.find({ user: { $in: userIds } }),
      User.find({ _id: { $in: userIds } }).select("email"),
    ]);

    const clientMap = new Map(clients.map((c) => [c.user.toString(), c]));
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const formatted = appointments.map((apt) => {
      const client = clientMap.get(apt.user?.toString());
      const userObj = userMap.get(apt.user?.toString());
      const clientName = client?.name || "Client";
      return {
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
        client: {
          id: apt.user,
          name: clientName,
          email: userObj?.email || "",
          phone: client?.phone || "",
          initials:
            clientName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "C",
        },
      };
    });

    res.json({ appointments: formatted });
  } catch (err) {
    console.error("Provider appointments error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/provider/appointments/:id ─────────────────────────────
router.patch("/appointments/:id", async (req, res) => {
  try {
    const { status, reason } = req.body;
    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider) return res.status(404).json({ message: "Provider not found." });

    const apt = await Appointment.findOne({
      _id: req.params.id,
      provider: provider._id,
    });
    if (!apt) return res.status(404).json({ message: "Appointment not found." });

    if (status) apt.status = status;
    if (reason) apt.notes = `${apt.notes ? apt.notes + " | " : ""}${reason}`;
    await apt.save();

    // Create client notification
    try {
      const Notification = require("../models/Notification.model");
      let notifTitle = "Appointment Status Updated";
      let notifMsg = `Your appointment for ${apt.service} is now ${status}.`;
      let notifType = `booking_${status}`;

      if (status === "confirmed") {
        notifTitle = "Appointment Confirmed!";
        notifMsg = `Great news! ${provider.name} confirmed your booking for ${apt.service} at ${apt.timeSlot}.`;
        notifType = "booking_confirmed";
      } else if (status === "cancelled") {
        notifTitle = "Appointment Declined";
        notifMsg = `Your appointment for ${apt.service} was declined by ${provider.name}.${reason ? ` Reason: ${reason}` : ""}`;
        notifType = "booking_cancelled";
      } else if (status === "completed") {
        notifTitle = "Appointment Completed";
        notifMsg = `Your session for ${apt.service} with ${provider.name} is complete! Please leave a review to share your feedback.`;
        notifType = "booking_completed";
      }

      await Notification.create({
        recipient: apt.user,
        recipientRole: "client",
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        appointment: apt._id,
      });
    } catch (notifErr) {
      console.warn("Provider appointment status notification failed:", notifErr.message);
    }

    res.json({ message: "Appointment status updated.", appointment: apt });
  } catch (err) {
    console.error("Update appointment status error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/provider/reviews ────────────────────────────────────────
router.get("/reviews", async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider) return res.status(404).json({ message: "Provider not found." });

    const rawReviews = await Review.find({ provider: provider._id })
      .sort({ createdAt: -1 });

    const clientUserIds = rawReviews.map((r) => r.client).filter(Boolean);
    const clients = await Client.find({ user: { $in: clientUserIds } });
    const clientMap = new Map(clients.map((c) => [c.user.toString(), c]));

    const reviews = rawReviews.map((r) => {
      const client = clientMap.get(r.client?.toString());
      return {
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        service: r.service,
        createdAt: r.createdAt,
        client: {
          name: client?.name || "Client",
          profileImage: client?.profileImage || "",
        },
      };
    });

    const stats = {
      total: reviews.length,
      averageRating: reviews.length
        ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : 0,
      breakdown: [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
      })),
    };

    res.json({ reviews, stats });
  } catch (err) {
    console.error("Provider reviews error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/provider/notifications ─────────────────────────────────
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.auth.userId,
      recipientRole: "provider",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.auth.userId,
      recipientRole: "provider",
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/provider/notifications/read-all ───────────────────────
router.patch("/notifications/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.auth.userId, recipientRole: "provider", read: false },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/provider/notifications/:id/read ───────────────────────
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

// ── DELETE /api/provider/notifications/:id ───────────────────────────
router.delete("/notifications/:id", async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.auth.userId,
      recipientRole: "provider",
    });
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json({ success: true, message: "Notification deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── DELETE /api/provider/notifications/clear-all ──────────────────────
router.delete("/notifications/clear-all", async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.auth.userId,
      recipientRole: "provider",
    });
    res.json({ success: true, message: "All notifications cleared." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/provider/calendar ───────────────────────────────────────
router.get("/calendar", async (req, res) => {
  try {
    const { year, month } = req.query;
    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider) return res.status(404).json({ message: "Provider not found." });

    const yr = parseInt(year) || new Date().getFullYear();
    const mo = parseInt(month) || new Date().getMonth() + 1;

    const startOfMonth = new Date(yr, mo - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(yr, mo, 0, 23, 59, 59, 999);

    const appointments = await Appointment.find({
      provider: provider._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ["pending", "confirmed", "completed"] },
    }).sort({ date: 1, timeSlot: 1 });

    const userIds = appointments.map((a) => a.user).filter(Boolean);
    const clients = await Client.find({ user: { $in: userIds } });
    const clientMap = new Map(clients.map((c) => [c.user.toString(), c]));

    // Group by date string
    const byDate = {};
    appointments.forEach((apt) => {
      const key = apt.date.toISOString().split("T")[0];
      if (!byDate[key]) byDate[key] = [];
      const client = clientMap.get(apt.user?.toString());
      const clientName = client?.name || "Client";
      byDate[key].push({
        id: apt._id,
        service: apt.service,
        timeSlot: apt.timeSlot,
        duration: apt.duration,
        status: apt.status,
        clientName,
        clientInitials:
          clientName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "C",
      });
    });

    res.json({ appointments: byDate });
  } catch (err) {
    console.error("Provider calendar error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

