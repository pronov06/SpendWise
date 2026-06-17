import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit"; // BUG-011 FIX: add rate limiting on auth
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
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allow local dev frontend origin
const allowedOrigins = [
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches our allowed list
    const isAllowed = allowedOrigins.some(allowed => origin === allowed);
    
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Rate limiter: max 10 auth requests per 15 minutes per IP
// Protects against OTP brute-force and credential spray attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes." },
});

// Rate limiter for chat: max 30 messages per 15 minutes per user (cost protection)
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many chat requests, please slow down." },
});

// Health check for Render/Uptime monitoring
app.get("/health", (_req, res) => res.json({ 
  status: "ok", 
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}));

app.use("/api/auth", authLimiter, authRoutes); // rate-limited
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
app.use("/api/chat", chatLimiter, chatRoutes); // rate-limited (API cost protection)

app.get("/", (_req, res) => res.json({ status: "SpendWise API running ✅" }));

// ─── Start HTTP server (only when NOT running in serverless Vercel environment) ────
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // Verify email configuration
    const emailConfigured = await verifyEmailConfig();
    if (!emailConfigured) {
      console.warn("⚠️  Email service not configured. OTP emails will not be sent.");
      console.warn("📧 To enable email, configure EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD in .env");
    }
  });
}

// ─── Connect to MongoDB with Serverless Connection Caching ───────────────────
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Faster timeout for serverless cold-starts
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4, // force IPv4 — avoids IPv6/Compass mismatch
};

let cachedConnection = null;

const connectDB = async () => {
  // If already connected or connecting, reuse it
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    console.log("✅ MongoDB connected successfully");
    return cachedConnection;
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    // In serverless, we don't want to loop/sleep for 25 seconds as it will timeout the request
    if (!process.env.VERCEL) {
      console.log("⏳ Retrying in 5 seconds...");
      setTimeout(connectDB, 5000);
    }
  }
};

mongoose.connection.on("error", (err) =>
  console.error("⚠️  MongoDB runtime error:", err.message)
);
mongoose.connection.on("disconnected", () =>
  console.warn("⚠️  MongoDB disconnected")
);

// Trigger connection
connectDB();

export default app;

