import { useState } from "react";
import { useNavigate } from "react-router";
import { IndianRupee, Calendar, FileText, Wallet } from "lucide-react";
import { budgetApi, transactionApi } from "@/app/services/api";
import { useNotifications } from "@/app/context/NotificationContext";

export function AddExpense() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = [
    { name: "Food & Dining", icon: "🍕", color: "bg-orange-100 text-orange-600" },
    { name: "Transportation", icon: "🚗", color: "bg-blue-100 text-blue-600" },
    { name: "Shopping", icon: "🛍️", color: "bg-pink-100 text-pink-600" },
    { name: "Entertainment", icon: "🎬", color: "bg-purple-100 text-purple-600" },
    { name: "Bills & Utilities", icon: "💡", color: "bg-yellow-100 text-yellow-600" },
    { name: "Health & Fitness", icon: "💊", color: "bg-green-100 text-green-600" },
    { name: "Education", icon: "📚", color: "bg-indigo-100 text-indigo-600" },
    { name: "Other", icon: "📌", color: "bg-gray-100 text-gray-600" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountNum = Number(formData.amount);
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!formData.category || !formData.date) {
      setError("Please select a category and date.");
      return;
    }
    try {
      setIsSubmitting(true);

      // --- Budget Alert Logic ---
      try {
        const budgets = await budgetApi.getAll();
        const catBudget = budgets.find((b: any) => b.category === formData.category);

        if (catBudget) {
          const newSpent = catBudget.spent + amountNum;
          if (newSpent > catBudget.limit) {
            addNotification({
              type: "error",
              title: "Budget Exceeded!",
              message: `You've spent ₹${newSpent.toLocaleString()} in ${formData.category}, which exceeds your ₹${catBudget.limit.toLocaleString()} budget!`,
            });
          } else if (newSpent > catBudget.limit * 0.8) {
            addNotification({
              type: "warning",
              title: "Budget Warning",
              message: `You've used ${((newSpent / catBudget.limit) * 100).toFixed(0)}% of your ${formData.category} budget.`,
            });
          }
        }
      } catch (alertErr) {
        console.error("Alert logic failed:", alertErr);
      }

      // --- Save Transaction ---
      await transactionApi.create({
        type: "expense",
        category: formData.category,
        description: formData.notes || formData.category,
        amount: amountNum,
        date: formData.date,
        icon: expenseCategories.find(c => c.name === formData.category)?.icon || "💸"
      });

      addNotification({
        type: "success",
        title: "Expense Added",
        message: `₹${amountNum} added to ${formData.category}`,
      });

      navigate("/dashboard/user");
    } catch (err: any) {
      setError(err?.message || "Failed to save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
        >
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Add Expense</h1>
            <p className="text-xs text-gray-500">Record your spending</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm text-gray-700">
              Amount *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-2xl font-semibold"
                required
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {expenseCategories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.name })}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${formData.category === category.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-xs text-gray-700 text-center leading-tight">
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm text-gray-700">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm text-gray-700">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="What did you spend on?"
                rows={4}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>

        {/* Quick Add Suggestions */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {["₹5", "₹10", "₹20", "₹50", "₹100"].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData({ ...formData, amount: amount.replace(/[^0-9.]/g, "") })}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition-colors"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-xl">💡</span>
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Tip: Be consistent with categories</p>
            <p className="text-red-700">
              Using the same categories for similar expenses helps you track spending patterns and create better budgets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}