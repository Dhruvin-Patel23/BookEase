const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    businessName: { type: String, trim: true },
    profession: { type: String, trim: true }, // was serviceName
    specializations: [{ type: String, trim: true }], // array only, specialization removed
    address: { type: String, trim: true },
    bio: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
    profileImage: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },

    notificationPrefs: {
      emailReminders: { type: Boolean, default: true },
      smsReminders: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
    },

    availability: {
      weeklySchedule: { type: mongoose.Schema.Types.Mixed, default: {} },
      defaultDuration: { type: Number, default: 30 },
      bufferTime: { type: String, default: "None" },
      blockedPeriods: [
        {
          title: { type: String },
          startDate: { type: String },
          endDate: { type: String },
          type: { type: String },
        },
      ],
      serviceDurations: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
