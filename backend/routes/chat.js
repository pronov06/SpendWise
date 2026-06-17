import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { protect } from "../middleware/auth.js";
import Expense from "../models/Expense.js"; // BUG-005 FIX: was Transaction (empty collection)
import Budget from "../models/Budget.js";
import User from "../models/User.js";

const router = express.Router();
router.use(protect);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        message: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file." 
      });
    }

    // Fetch user context
    const userId = req.user._id;
    const user = await User.findById(userId);
    const budgets = await Budget.find({ userId });
    
    // Fetch all expenses for the current year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    // BUG-005 FIX: query Expense model (where add-expense flow stores data)
    const expenses = await Expense.find({
      userId,
      date: { $gte: startOfYear }
    });

    // Aggregate expenses
    let totalMonthly = 0;
    let totalWeekly = 0;
    let totalAnnual = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start

    const categorySpending = {};

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      totalAnnual += exp.amount;

      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        totalMonthly += exp.amount;
        categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
      }

      if (expDate >= startOfWeek) {
        totalWeekly += exp.amount;
      }
    });

    const monthlyBudgetLimit = user.monthlyBudget || 0;

    let budgetContext = "Budgets set:\n";
    if (budgets.length > 0) {
      budgets.forEach(b => {
        budgetContext += `- ${b.category}: ₹${b.limit} limit\n`;
      });
    } else {
      budgetContext += "- No category-specific budgets set.\n";
    }

    let categoryContext = "Spending by category this month:\n";
    Object.keys(categorySpending).forEach(cat => {
      categoryContext += `- ${cat}: ₹${categorySpending[cat]}\n`;
    });

    // Basic Keyword Retrieval (RAG implementation)
    const keywords = message.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !["what", "how", "much", "spent", "did", "this", "that", "have"].includes(w));
    let relevantTransactions = [];
    
    if (keywords.length > 0) {
      // Search all expenses for matches
      relevantTransactions = expenses.filter(exp => {
        const textToSearch = `${exp.title} ${exp.category} ${exp.notes || ""}`.toLowerCase();
        return keywords.some(kw => textToSearch.includes(kw));
      }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10); // Top 10 recent matching
    }

    let ragContext = "";
    if (relevantTransactions.length > 0) {
      ragContext = "\nRetrieved relevant transactions based on user query:\n";
      relevantTransactions.forEach(t => {
        ragContext += `- ${new Date(t.date).toLocaleDateString()}: ₹${t.amount} on ${t.title} [Category: ${t.category}]\n`;
      });
    } else {
      ragContext = "\nNo specific past transactions matched the query keywords.\n";
    }

    // Construct system prompt
    const systemPrompt = `You are an expert financial advisor AI integrated into an expense tracker app called SpendWise.
Your goal is to help the user optimize their expenses and provide insights into their spending habits.

Here is the user's current financial context:
- Overall Monthly Budget Limit: ₹${monthlyBudgetLimit}
- Total spent this month: ₹${totalMonthly}
- Total spent this week: ₹${totalWeekly}
- Total spent this year: ₹${totalAnnual}

${categoryContext}
${budgetContext}
${ragContext}

Instructions:
- Analyze the user's spending against their budget limits.
- If they are over limit or close to it, offer specific advice to optimize their expenses.
- Keep your answers concise, helpful, and friendly.
- Format your response with markdown (e.g. bolding key terms, bullet points) so it looks good in a chat interface.
- Do NOT provide financial advice outside the scope of expense tracking and budgeting.

User says: "${message}"`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (err) {
    console.error("Chat API error:", err);
    res.status(500).json({ message: "An error occurred: " + err.message });
  }
});

export default router;
