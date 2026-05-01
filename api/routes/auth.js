import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/emailService.js";

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password,
      role: "user",
      otp,
      otpExpires,
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    // Log OTP to console for easy local testing
    console.log(`\n🔑 DEVELOPMENT OTP for ${email}: ${otp}\n`);

    res.status(201).json({
      message: "✅ Registered! OTP sent to your email. Check inbox and verify.",
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    const token = generateToken(user._id);
    res.json({
      message: "✅ Account verified! Welcome to SpendWise!",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send new OTP via email
    await sendOTPEmail(email, otp);
    
    // Log OTP to console for easy local testing
    console.log(`\n🔑 DEVELOPMENT OTP for ${email}: ${otp}\n`);
    
    res.json({ message: "✅ New OTP sent to your email!" });
  } catch (err) {
    console.error("Resend OTP error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your account first", needsVerification: true, email });
    }

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
