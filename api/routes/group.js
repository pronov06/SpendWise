import express from "express";
import GroupExpense from "../models/GroupExpense.js";
import { protect } from "../middleware/auth.js";
import { sendGroupSplitEmail } from "../services/emailService.js";

const router = express.Router();
router.use(protect);

// ─── GET /api/group-expenses — list groups the user belongs to ───────────────
router.get("/", async (req, res) => {
  try {
    const groups = await GroupExpense.find({
      $or: [{ createdBy: req.user._id }, { "members.user": req.user._id }],
    }).sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/group-expenses/:id — single group ──────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const group = await GroupExpense.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember =
      group.createdBy.toString() === req.user._id.toString() ||
      group.members.some(
        (m) => m.user && m.user.toString() === req.user._id.toString()
      );
    if (!isMember) return res.status(403).json({ message: "Unauthorized" });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/group-expenses — create a group ───────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ message: "Group name is required" });

    const group = await GroupExpense.create({
      name: name.trim(),
      description: description || "",
      icon: icon || "👥",
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      ],
      expenses: [],
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/group-expenses/:id/add-member ─────────────────────────────────
router.post("/:id/add-member", async (req, res) => {
  try {
    const group = await GroupExpense.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only creator or existing members can add people
    const isMember =
      group.createdBy.toString() === req.user._id.toString() ||
      group.members.some(
        (m) => m.user && m.user.toString() === req.user._id.toString()
      );
    if (!isMember) return res.status(403).json({ message: "Unauthorized" });

    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "name and email are required" });

    // Prevent duplicates
    const exists = group.members.some((m) => m.email === email.trim());
    if (exists)
      return res.status(400).json({ message: "Member already in group" });

    group.members.push({ user: null, name: name.trim(), email: email.trim() });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/group-expenses/:id/add-expense ────────────────────────────────
router.post("/:id/add-expense", async (req, res) => {
  try {
    const group = await GroupExpense.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { description, amount, category, date, paidByMemberId } = req.body;
    if (!description || !amount)
      return res
        .status(400)
        .json({ message: "description and amount are required" });

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return res
        .status(400)
        .json({ message: "amount must be a positive number" });

    // Resolve who paid — either a chosen member or the logged-in user.
    // IMPORTANT: Always use the member subdoc _id (not user ObjectId) so
    // the frontend balance calculation can match against member.id correctly.
    let resolvedPaidBy = null;
    let resolvedPaidByName = req.user.name;

    if (paidByMemberId) {
      const payer = group.members.find(
        (m) => m._id.toString() === paidByMemberId
      );
      if (payer) {
        resolvedPaidBy = payer._id;   // always subdoc _id
        resolvedPaidByName = payer.name;
      }
    }

    // Fall back: find the logged-in user in the members list and use their subdoc _id
    if (!resolvedPaidBy) {
      const selfMember = group.members.find(
        (m) => m.user && m.user.toString() === req.user._id.toString()
      );
      resolvedPaidBy = selfMember ? selfMember._id : req.user._id;
      resolvedPaidByName = selfMember ? selfMember.name : req.user.name;
    }

    // splitAmong = all member subdoc _ids (consistent with paidBy key above)
    const splitAmong = group.members.map((m) => m._id);

    group.expenses.push({
      description: description.trim(),
      amount: parsedAmount,
      category: category || "General",
      date: date ? new Date(date) : new Date(),
      paidBy: resolvedPaidBy,
      paidByName: resolvedPaidByName,
      splitAmong,
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/group-expenses/:groupId/expenses/:expenseId ─────────────────
router.delete("/:groupId/expenses/:expenseId", async (req, res) => {
  try {
    const group = await GroupExpense.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const expIdx = group.expenses.findIndex(
      (e) => e._id.toString() === req.params.expenseId
    );
    if (expIdx === -1)
      return res.status(404).json({ message: "Expense not found" });

    group.expenses.splice(expIdx, 1);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/group-expenses/:id — delete entire group ────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const group = await GroupExpense.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!group)
      return res
        .status(404)
        .json({ message: "Group not found or unauthorized" });
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/group-expenses/:id/send-split-emails ──────────────────────────
router.post("/:id/send-split-emails", async (req, res) => {
  try {
    const group = await GroupExpense.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { settlements, totalExpenses } = req.body;

    // We use the settlements and totalExpenses from frontend for convenience, 
    // but we could also calculate them here.
    
    const expensesList = group.expenses.map(e => ({
      description: e.description,
      amount: e.amount,
      paidByName: e.paidByName || "Unknown"
    }));

    const emailPromises = group.members.map(member => 
      sendGroupSplitEmail(
        member.email,
        member.name,
        group.name,
        settlements,
        totalExpenses,
        expensesList
      )
    );

    await Promise.all(emailPromises);

    res.json({ message: "Split emails sent successfully to all members" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
