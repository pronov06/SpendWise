import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js"; // BUG-005 FIX: was querying Transaction (wrong model)
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/budget — returns budgets with `spent` calculated from transactions
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (b) => {
        // BUG-005 FIX: query Expense collection (where add-expense flow saves data)
        const spent = await Expense.aggregate([
          {
            $match: {
              userId: req.user._id,
              category: b.category,
              date: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return { ...b.toObject(), spent: spent[0]?.total || 0 };
      })
    );
    res.json(budgetsWithSpent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/budget
router.post("/", async (req, res) => {
  try {
    const { category, limit, period, color, icon } = req.body;
    if (!category || !limit) return res.status(400).json({ message: "category and limit required" });

    // Prevent duplicate categories
    const existing = await Budget.findOne({ userId: req.user._id, category });
    if (existing) return res.status(400).json({ message: "Budget for this category already exists" });

    const budget = await Budget.create({
      userId: req.user._id, category, limit, period: period || "monthly",
      color: color || "#14b8a6", icon: icon || "💰"
    });
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/budget/:id
router.put("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    // BUG-006 FIX: whitelist fields — prevents overwriting userId or _id via req.body
    const { category, limit, period, color, icon } = req.body;
    if (category !== undefined) budget.category = category;
    if (limit !== undefined) budget.limit = limit;
    if (period !== undefined) budget.period = period;
    if (color !== undefined) budget.color = color;
    if (icon !== undefined) budget.icon = icon;
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/budget/:id
router.delete("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
