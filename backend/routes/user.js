import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/user/profile
router.get("/profile", async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
      monthlyBudget: req.user.monthlyBudget,
      budgetAlerts: req.user.budgetAlerts,
      categoryAlerts: req.user.categoryAlerts,
      weeklySummary: req.user.weeklySummary,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/profile
router.put("/profile", async (req, res) => {
  try {
    const { name, phone, avatar, monthlyBudget, budgetAlerts, categoryAlerts, weeklySummary } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
    if (budgetAlerts !== undefined) user.budgetAlerts = budgetAlerts;
    if (categoryAlerts !== undefined) user.categoryAlerts = categoryAlerts;
    if (weeklySummary !== undefined) user.weeklySummary = weeklySummary;
    await user.save();
    res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone, 
      role: user.role, 
      avatar: user.avatar,
      monthlyBudget: user.monthlyBudget,
      budgetAlerts: user.budgetAlerts,
      categoryAlerts: user.categoryAlerts,
      weeklySummary: user.weeklySummary
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/change-password
router.put("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
