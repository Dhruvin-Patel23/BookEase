const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const Appointment = require("../models/Appointment.model");
const ServiceProvider = require("../models/ServiceProvider.model");

router.use(requireAuth);
router.use(requireRole("provider"));

// GET /api/provider/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.auth.userId; // ✅ req.auth not req.user

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

// PATCH /api/provider/appointments/:id
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

module.exports = router;
