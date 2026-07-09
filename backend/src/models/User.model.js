const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["client", "provider"], required: true },
    resetOTP: { type: String, select: false },
    resetOTPExpires: { type: Date, select: false },
    resetOTPVerified: { type: Boolean, default: false, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
