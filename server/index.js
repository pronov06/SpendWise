// SpendWise API Server - Updated
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { verifyEmailConfig } from "./services/emailService.js";

import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import expenseRoutes from "./routes/expenses.js";
import incomeRoutes from "./routes/incomes.js";
import budgetRoutes from "./routes/budget.js";
import groupRoutes from "./routes/group.js";
import groupsRoutes from "./routes/groups.js";
import reportsRoutes from "./routes/reports.js";
import heatmapRoutes from "./routes/heatmap.js";
import feedbackRoutes from "./routes/feedback.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow both local dev and the live Vercel frontend
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // In production, we specifically want to allow the Vercel URL
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.endsWith('.vercel.app')
    );
    
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Health check for Render/Uptime monitoring
app.get("/health", (_req, res) => res.json({ 
  status: "ok", 
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/group-expenses", groupRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/user", userRoutes);

app.get("/", (_req, res) => res.json({ status: "SpendWise API running ✅" }));

// ─── Start HTTP server immediately so the frontend can always reach it ────────
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Verify email configuration
  const emailConfigured = await verifyEmailConfig();
  if (!emailConfigured) {
    console.warn("⚠️  Email service not configured. OTP emails will not be sent.");
    console.warn("📧 To enable email, configure EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD in .env");
  }
});

// ─── Connect to MongoDB in the background with retry ─────────────────────────
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4, // force IPv4 — avoids IPv6/Compass mismatch
};

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, mongoOptions);
      console.log("✅ MongoDB connected successfully");
      return;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) {
        console.log("⏳ Retrying in 5 seconds...");
        await new Promise((res) => setTimeout(res, 5000));
      } else {
        console.error("❌ Could not connect to MongoDB after all retries.");
      }
    }
  }
};

mongoose.connection.on("error", (err) =>
  console.error("⚠️  MongoDB runtime error:", err.message)
);
mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected")
);

connectDB();

