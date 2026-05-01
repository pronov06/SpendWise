import mongoose from "mongoose";

const expenseItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount:      { type: Number, required: true, min: 0 },
    category:    { type: String, default: "General" },
    date:        { type: Date, default: Date.now },
    paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidByName:  { type: String },
    splitAmong:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true }
);

const groupExpenseSchema = new mongoose.Schema(
  {
    // ── Group identity ──────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon:        { type: String, default: "👥" },

    // ── Ownership ───────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Members (can include non-registered users by email) ──
    members: [
      {
        user:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name:  { type: String, required: true },
        email: { type: String, required: true },
      },
    ],

    // ── Expenses live here — stored in the groupexpenses collection ──
    expenses: [expenseItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("GroupExpense", groupExpenseSchema);
