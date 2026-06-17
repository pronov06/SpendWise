import express from "express";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/heatmap — daily spending for the last 365 days
router.get("/", async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const data = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "expense",
          date: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const result = data.map(({ _id, total, count }) => ({
      date: `${_id.year}-${String(_id.month).padStart(2, "0")}-${String(_id.day).padStart(2, "0")}`,
      amount: total,
      count,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
