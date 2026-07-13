const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const Appointment = require("../models/Appointment.model");
const ServiceProvider = require("../models/ServiceProvider.model");
const User = require("../models/User.model");

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
      }).populate("user", "name"),
      Appointment.find({
        provider: provider._id,
        status: "pending",
      })
        .populate("user", "name")
        .sort({ date: 1 }),
    ]);

    res.json({
      stats: {
        todayAppointments,
        pendingRequests,
        completed,
        cancelled,
        averageRating: provider.rating || 0,
      },
      isProfileComplete: provider.isProfileComplete || false,
      pendingRequests: allPending.map((apt) => ({
        id: apt._id,
        name: apt.user?.name || "Unknown",
        initials:
          apt.user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "?",
        service: apt.service,
        date: apt.date?.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: apt.timeSlot,
        duration: apt.duration ? `${apt.duration} min` : "N/A",
        status: apt.status,
      })),
      confirmedToday: confirmedToday.map((apt) => ({
        id: apt._id,
        name: apt.user?.name || "Unknown",
        initials:
          apt.user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("") || "?",
        service: apt.service,
        time: apt.timeSlot,
      })),
    });
  } catch (err) {
    console.error("Provider dashboard error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── PATCH /api/provider/appointments/:id ─────────────────────────────
router.patch("/appointments/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!apt) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({ message: `Appointment ${status}.`, appointment: apt });
  } catch (err) {
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

    res.json({ message: "Profile updated.", isProfileComplete });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error." });
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

module.exports = router;
