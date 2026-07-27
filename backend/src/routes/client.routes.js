const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const Appointment = require("../models/Appointment.model");
const Client = require("../models/Client.model");

router.use(requireAuth);
router.use(requireRole("client"));

// GET /api/client/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.auth.userId;

    const client = await Client.findOne({ user: userId });
    if (!client) {
      return res.status(404).json({ message: "Client profile not found." });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // run all queries in parallel
    const [
      totalBooked,
      completed,
      cancelled,
      upcomingList,
      recentNotifications,
    ] = await Promise.all([
      // total ever booked
      Appointment.countDocuments({ user: userId }),

      // completed
      Appointment.countDocuments({ user: userId, status: "completed" }),

      // cancelled
      Appointment.countDocuments({ user: userId, status: "cancelled" }),

      // upcoming — confirmed + future date, sorted soonest first
      Appointment.find({
        user: userId,
        status: { $in: ["confirmed", "pending"] },
        date: { $gte: today },
      })
        .populate("provider", "name serviceName address")
        .sort({ date: 1, timeSlot: 1 })
        .limit(10),

      // placeholder notifications — real notifications collection coming later
      [],
    ]);

    const upcoming = upcomingList.length;

    // format appointments for frontend
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
      notifications: [],
    });
  } catch (err) {
    console.error("Client dashboard error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
