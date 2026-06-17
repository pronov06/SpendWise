import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }],
    icon: { type: String, default: "💸" },
    paymentMethod: { type: String, default: "cash" },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
