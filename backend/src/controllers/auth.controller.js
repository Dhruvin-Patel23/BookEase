const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Authentication = require("../models/Authentication.model");
const User = require("../models/User.model");

const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// ── Register ────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      password,
      role,
      specialization,
      address,
    } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role || !gender) {
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
      return res
        .status(400)
        .json({
          message: "Specialization and address are required for providers.",
        });
    }

    // 2. Check email not already taken
    const existing = await Authentication.findOne({
      email: email.toLowerCase(),
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    // 3. Hash password
    const hashed = await bcrypt.hash(password, 12);

    // 4. Create User
    const user = await User.create({
      name,
      phoneNo: phone,
      gender,
      role,
      ...(role === "provider" && {
        providerProfile: { specialization, address },
      }),
    });

    // 5. Create Authentication record linked to User
    await Authentication.create({
      email: email.toLowerCase(),
      password: hashed,
      user: user._id,
      isVerified: true,
    });

    // 6. Issue JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: email.toLowerCase(),
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

    // 1. Validate required fields
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }
    if (!["client", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    // 2. Find auth record + linked user
    const auth = await Authentication.findOne({ email: email.toLowerCase() })
      .select("+password +failedLoginAttempts +lockUntil")
      .populate("user");

    if (!auth || !auth.user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3. Check account lock
    if (auth.lockUntil && auth.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((auth.lockUntil - Date.now()) / 60000);
      return res
        .status(423)
        .json({ message: `Account locked. Try again in ${minutesLeft} min.` });
    }

    // 4. Check role matches
    if (auth.user.role !== role) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 5. Check account is active
    if (!auth.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been deactivated." });
    }

    // 6. Compare password
    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) {
      auth.failedLoginAttempts += 1;
      if (auth.failedLoginAttempts >= MAX_ATTEMPTS) {
        auth.lockUntil = Date.now() + LOCK_TIME;
        auth.failedLoginAttempts = 0;
      }
      await auth.save();
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 7. Successful login — reset security counters
    auth.failedLoginAttempts = 0;
    auth.lockUntil = undefined;
    auth.lastLogin = new Date();
    await auth.save();

    // 8. Issue JWT
    const token = jwt.sign(
      { authId: auth._id, userId: auth.user._id, role: auth.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: auth.user._id,
        name: auth.user.name,
        email: auth.email,
        role: auth.user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login." });
  }
};
