import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }],
    icon: { type: String, default: "💰" },
    source: { type: String, default: "salary" },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);
