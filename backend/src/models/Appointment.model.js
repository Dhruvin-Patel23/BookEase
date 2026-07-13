const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceProvider",
      required: true,
    },
    service: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    duration: { type: Number },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
