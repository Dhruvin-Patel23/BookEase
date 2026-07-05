const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    // Login relationship: 1 User <-> 1 Authentication
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // bcrypt hash, never returned by default

    // Account state
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Email verification
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Session / security tracking
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Authentication", authSchema);
