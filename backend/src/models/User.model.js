const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNo: { type: String, trim: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    role: { type: String, enum: ["client", "provider"], required: true },

    // Only populated when role === "provider"
    providerProfile: {
      address: { type: String },
      specialization: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
