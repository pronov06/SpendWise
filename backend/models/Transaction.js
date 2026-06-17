import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }],
    icon: { type: String, default: "💰" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
