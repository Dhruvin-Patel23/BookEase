// GET /api/provider/availability
exports.getAvailability = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.auth.userId });
    if (!provider)
      return res.status(404).json({ message: "Provider not found" });
    res.json(provider.availability || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/provider/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { weeklySchedule, defaultDuration, bufferTime, blockedPeriods } =
      req.body;
    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.auth.userId },
      {
        availability: {
          weeklySchedule,
          defaultDuration,
          bufferTime,
          blockedPeriods,
        },
      },
      { new: true },
    );
    if (!provider)
      return res.status(404).json({ message: "Provider not found" });
    res.json({
      message: "Availability updated",
      availability: provider.availability,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
