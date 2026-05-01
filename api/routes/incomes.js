import express from "express";
import Income from "../models/Income.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/incomes — Get all incomes with filters
router.get("/", async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [incomes, total] = await Promise.all([
      Income.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Income.countDocuments(filter),
    ]);

    res.json({
      incomes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/incomes/by-category — Get incomes grouped by category
router.get("/by-category", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const incomes = await Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/incomes — Create a new income
router.post("/", async (req, res) => {
  try {
    const {
      category,
      description,
      amount,
      date,
      tags,
      icon,
      source,
      isRecurring,
      recurringInterval,
    } = req.body;

    if (!category || !description || !amount) {
      return res.status(400).json({
        message: "category, description, and amount are required",
      });
    }

    const income = await Income.create({
      userId: req.user._id,
      category,
      description,
      amount,
      date: date || new Date(),
      tags: tags || [],
      icon: icon || "💰",
      source: source || "salary",
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || null,
    });

    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/incomes/:id — Update an income
router.put("/:id", async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    Object.assign(income, req.body);
    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/incomes/:id — Delete an income
router.delete("/:id", async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
