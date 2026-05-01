import express from "express";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/reports/summary — current month total income, expense, balance
router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

let dateFilter = {};

if (startDate && endDate) {
  dateFilter = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
  };
} else {
  // fallback → current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  dateFilter = { $gte: startOfMonth };
}

    const [income, expense, allTime] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: "income", date: dateFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: "expense", date: dateFilter } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const incomeTotal = income[0]?.total || 0;
    const expenseTotal = expense[0]?.total || 0;
    const allTimeMap = {};
    allTime.forEach((r) => (allTimeMap[r._id] = r.total));

    res.json({
      monthlyIncome: incomeTotal,
      monthlyExpense: expenseTotal,
      balance: incomeTotal - expenseTotal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/category-breakdown — expense by category (current month)
router.get("/category-breakdown", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

let dateFilter = {};

if (startDate && endDate) {
  dateFilter = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
  };
} else {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  dateFilter = { $gte: startOfMonth };
}

    const data = await Transaction.aggregate([
      { 
        $match: { 
          userId: req.user._id, 
          type: "expense", 
          date: dateFilter 
        } 
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);
    res.json(data.map((d) => ({ category: d._id, amount: d.total })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports/monthly-trend — last 6 months income vs expense
router.get("/monthly-trend", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

let match = { userId: req.user._id };

if (startDate && endDate) {
  match.date = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
  };
} else {
  // fallback → last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  match.date = { $gte: sixMonthsAgo };
}

    const data = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = {};
    data.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
      if (!months[key]) months[key] = { month: key, income: 0, expense: 0 };
      months[key][_id.type] = total;
    });

    res.json(Object.values(months));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
