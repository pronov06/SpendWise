import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ["weekly", "monthly"], default: "monthly" },
    color: { type: String, default: "#14b8a6" },
    icon: { type: String, default: "💰" },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
