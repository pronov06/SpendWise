import express from "express";
import Feedback from "../models/Feedback.js";
import { protect } from "../middleware/auth.js";
import { sendFeedbackEmailToAdmin } from "../services/emailService.js";

const router = express.Router();
router.use(protect);

// GET /api/feedback — Get all feedback for user
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ feedbacks, total: feedbacks.length });
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/feedback
router.post("/", async (req, res) => {
  try {
    const { type, message, rating } = req.body;
    
    console.log("📝 Feedback submission received:");
    console.log("  User ID:", req.user._id);
    console.log("  Type:", type);
    console.log("  Message:", message);
    console.log("  Rating:", rating);
    
    if (!message) return res.status(400).json({ message: "Message is required" });
    
    const fb = await Feedback.create({
      userId: req.user._id,
      type: type || "general",
      message,
      rating: rating || 5
    });
    
    console.log("✅ Feedback saved successfully:", fb._id);
    
    // Send email notification to admin asynchronously
    sendFeedbackEmailToAdmin(req.user, fb);

    res.status(201).json({ message: "Thanks for your feedback!", feedback: fb });
  } catch (err) {
    console.error("❌ Feedback save error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
