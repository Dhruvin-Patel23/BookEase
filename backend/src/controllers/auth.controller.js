const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.model");
const Client = require("../models/Client.model");
const ServiceProvider = require("../models/ServiceProvider.model");
const { sendOTPEmail } = require("../services/email.service");

// ── Register ────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      specialization,
      address,
      serviceName,
      businessName,
      bio,
    } = req.body;

    // 1. Validate
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!["client", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }
    if (role === "provider" && (!specialization || !address)) {
      return res.status(400).json({
        message: "Specialization and address are required for providers.",
      });
    }

    // 2. Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    // 3. Hash password
    const hashed = await bcrypt.hash(password, 12);

    // 4. Create User — no name/phone here, those live in Client/ServiceProvider
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      role,
    });

    // 5. Create role-specific profile with name and phone
    if (role === "client") {
      await Client.create({
        user: user._id,
        name: name.trim(),
        phone: phone?.trim(),
      });
    }

    if (role === "provider") {
      await ServiceProvider.create({
        user: user._id,
        name: name.trim(),
        phone: phone?.trim(),
        serviceName: serviceName?.trim(),
        businessName: businessName || name,
        specialization,
        address,
        bio: bio || "",
        contactEmail: email.toLowerCase(),
      });
    }

    // 6. Sign JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: name.trim(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ── Login ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }
    if (!["client", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.role !== role) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ── Fetch full profile based on role ──────────────────────────
    let userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    if (role === "client") {
      const client = await Client.findOne({ user: user._id });
      userResponse = {
        ...userResponse,
        name: client?.name || "",
        phone: client?.phone || "",
        dateOfBirth: client?.dateOfBirth || null,
        profileImage: client?.profileImage || null,
      };
    }

    if (role === "provider") {
      const provider = await ServiceProvider.findOne({ user: user._id });
      userResponse = {
        ...userResponse,
        name: provider?.name || "", // ✅ removed name.trim()
        phone: provider?.phone || "",
        serviceName: provider?.serviceName || "", // ✅ fixed — was businessName
        specialization: provider?.specialization || "",
        address: provider?.address || "",
        contactEmail: provider?.contactEmail || "",
        rating: provider?.rating || 0,
      };
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ── Send OTP ────────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email. Please create an account.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetOTP = otp;
    user.resetOTPExpires = expires;
    user.resetOTPVerified = false;
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({ message: "If that email exists, an OTP has been sent." });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Verify OTP ──────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+resetOTP +resetOTPExpires +resetOTPVerified",
    );

    if (!user || !user.resetOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    if (user.resetOTPExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    if (user.resetOTP !== otp) {
      return res
        .status(400)
        .json({ message: "Incorrect OTP. Please try again." });
    }

    user.resetOTPVerified = true;
    await user.save();

    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Reset Password ──────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +resetOTP +resetOTPExpires +resetOTPVerified",
    );

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }
    if (!user.resetOTPVerified) {
      return res
        .status(403)
        .json({ message: "OTP not verified. Please verify your OTP first." });
    }
    if (user.resetOTPExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Session expired. Please start again." });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    user.resetOTPVerified = undefined;
    await user.save();

    res.json({ message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
};
