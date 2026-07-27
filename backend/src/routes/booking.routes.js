const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const ServiceProvider = require("../models/ServiceProvider.model");
const Appointment = require("../models/Appointment.model");

router.use(requireAuth);
router.use(requireRole("client"));

// ── GET /api/booking/providers?specialization=Fitness ─────────────────
router.get("/providers", async (req, res) => {
  try {
    const { specialization } = req.query;

    const filter = { isAvailable: true };
    if (specialization) {
      filter.specializations = {
        $elemMatch: { $regex: new RegExp(specialization, "i") },
      };
    }

    const providers = await ServiceProvider.find(filter).select(
      "name profession specializations address rating reviewCount bio isAvailable availability",
    );

    res.json({ providers });
  } catch (err) {
    console.error("Get providers error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET /api/booking/slots?providerId=&date=2026-07-16 ────────────────
router.get("/slots", async (req, res) => {
  try {
    const { providerId, date, specialization } = req.query;

    if (!providerId || !date) {
      return res
        .status(400)
        .json({ message: "providerId and date are required." });
    }

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found." });
    }

    // parse as LOCAL date to avoid UTC timezone day shift
    const [yr, mo, dy] = date.split("-").map(Number);
    const dateObj = new Date(yr, mo - 1, dy);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dateObj.getDay()];

    // ── weeklySchedule is Mixed (plain object), use bracket access ──
    const weeklySchedule = provider.availability?.weeklySchedule || {};
    const schedule = weeklySchedule[dayName];

    if (!schedule || !schedule.enabled) {
      return res.json({
        slots: [],
        message: `Provider is not available on ${dayName}.`,
      });
    }

    // check blocked periods
    const isBlocked = (provider.availability?.blockedPeriods || []).some(
      (bp) => date >= bp.startDate && date <= bp.endDate,
    );
    if (isBlocked) {
      return res.json({
        slots: [],
        message: "Provider is not available on this date.",
      });
    }

    // ── serviceDurations is Mixed (plain object), use bracket access ──
    const serviceDurations = provider.availability?.serviceDurations || {};
    let duration = provider.availability?.defaultDuration || 30;
    if (specialization && serviceDurations[specialization]) {
      duration = serviceDurations[specialization];
    }

    // parse buffer time
    const bufferStr = provider.availability?.bufferTime || "None";
    const buffer = bufferStr === "None" ? 0 : parseInt(bufferStr) || 0;

    // generate slots
    const slots = generateSlots(
      schedule.start,
      schedule.end,
      schedule.breaks || [],
      duration,
      buffer,
    );

    // find already booked slots
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedApts = await Appointment.find({
      provider: providerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    const bookedTimes = new Set(bookedApts.map((a) => a.timeSlot));

    const result = slots.map((slot) => ({
      time: slot,
      isBooked: bookedTimes.has(slot),
    }));

    res.json({ slots: result, duration, dayName });
  } catch (err) {
    console.error("Get slots error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/booking/book ────────────────────────────────────────────
router.post("/book", async (req, res) => {
  try {
    const { providerId, specialization, date, timeSlot, notes } = req.body;
    const userId = req.auth.userId;

    if (!providerId || !specialization || !date || !timeSlot) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // prevent double booking
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      provider: providerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existing) {
      return res.status(409).json({
        message: "This slot was just booked. Please choose another time.",
      });
    }

    const provider = await ServiceProvider.findById(providerId);
    const serviceDurations = provider?.availability?.serviceDurations || {};
    let duration = provider?.availability?.defaultDuration || 30;
    if (specialization && serviceDurations[specialization]) {
      duration = serviceDurations[specialization];
    }

    const appointment = await Appointment.create({
      user: userId,
      provider: providerId,
      service: specialization,
      date: new Date(date),
      timeSlot,
      duration,
      notes: notes || "",
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: {
        id: appointment._id,
        service: appointment.service,
        providerName: provider?.name || "Unknown",
        date: new Date(date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        timeSlot: appointment.timeSlot,
        duration: appointment.duration,
        status: appointment.status,
      },
    });
  } catch (err) {
    console.error("Book appointment error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── Slot generation engine ────────────────────────────────────────────
function generateSlots(startTime, endTime, breaks, duration, buffer) {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const step = duration + buffer;

  while (current + duration <= end) {
    const slotEnd = current + duration;

    const inBreak = breaks.some((b) => {
      const bStart = timeToMinutes(b.start);
      const bEnd = timeToMinutes(b.end);
      return current < bEnd && slotEnd > bStart;
    });

    if (!inBreak) {
      slots.push(minutesToTime(current));
    }

    current += step;
  }

  return slots;
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

module.exports = router;
