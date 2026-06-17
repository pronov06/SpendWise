import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bug", "feature", "general", "praise"], default: "general" },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
