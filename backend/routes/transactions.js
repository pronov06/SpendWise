import express from "express";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/transactions
router.get("/", async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);
    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const { type, category, description, amount, date, tags, icon } = req.body;
    if (!type || !category || !description || !amount) {
      return res.status(400).json({ message: "type, category, description, amount are required" });
    }
    const tx = await Transaction.create({
      userId: req.user._id, type, category, description,
      amount, date: date || new Date(), tags: tags || [], icon: icon || "💰"
    });
    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    Object.assign(tx, req.body);
    await tx.save();
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
