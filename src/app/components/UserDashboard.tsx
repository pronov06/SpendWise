import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { reportsApi, transactionApi } from "@/app/services/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f59e0b",
  Transportation: "#8b5cf6",
  Shopping: "#ef4444",
  Entertainment: "#3b82f6",
  "Bills & Utilities": "#14b8a6",
  Salary: "#10b981",
  Freelance: "#6366f1",
  Investment: "#0ea5e9",
  Other: "#64748b",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Food & Dining": "🍕", Transportation: "🚗", Shopping: "🛍️",
  Entertainment: "🎬", "Bills & Utilities": "💡", Salary: "💼",
  Freelance: "💻", Investment: "📈", Other: "💰",
};

interface Transaction {
  _id: string; type: string; category: string;
  description: string; amount: number; date: string; icon?: string;
}
interface CategoryItem { category: string; amount: number; }

export function UserDashboard() {
  const [summary, setSummary] = useState({ balance: 0, monthlyIncome: 0, monthlyExpense: 0 });
  const [allTimeBalance, setAllTimeBalance] = useState(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Get current month for monthly summary and categories
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const startDate = startOfMonth.toISOString().split('T')[0];
        const endDate = endOfMonth.toISOString().split('T')[0];

        // Get data for dashboard
        const [summaryData, categoryData] = await Promise.all([
          reportsApi.getSummary({ startDate, endDate }),
          reportsApi.getCategoryBreakdown({ startDate, endDate }),
        ]);
        
        // Get all transactions (both old and new)
        const allTxRes = await transactionApi.getAll({ limit: "99999" });
        const allTx = allTxRes.transactions || [];
        
        // Calculate all-time balance from transactions
        let totalExpenses = 0;
        let totalIncomes = 0;
        
        allTx.forEach((tx: any) => {
          // Determine type - check multiple possible field names
          const txType = tx.type || tx.txType || (tx.amount < 0 ? "expense" : "income");
          const amount = Math.abs(tx.amount || 0); // Get absolute value
          
          if (txType === "expense" || txType === "Expense" || txType === "spending") {
            totalExpenses += amount;
          } else if (txType === "income" || txType === "Income") {
            totalIncomes += amount;
          }
        });
        
        const allTimeBalance = totalIncomes - totalExpenses;
        
        setSummary(summaryData);
        setAllTimeBalance(allTimeBalance);
        setCategories(categoryData);
        setTransactions(allTx.slice(0, 5)); // Show first 5 recent
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = categories.map((c) => ({
    name: c.category,
    value: c.amount,
    color: CATEGORY_COLORS[c.category] || "#64748b",
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm opacity-90">Total Balance</span>
            <Wallet className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-2">₹{allTimeBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <TrendingUp className="w-4 h-4" />
            <span>All time net balance</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Monthly Income</span>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            ₹{summary.monthlyIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-green-600">This month's income</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Monthly Expense</span>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            ₹{summary.monthlyExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-red-600">This month's spending</div>
        </div>
      </div>

      {/* Charts + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Pie */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h2>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-4xl mb-3">📊</span>
              <p className="text-sm">No expenses yet this month</p>
              <Link to="/add-expense" className="mt-3 text-red-600 text-sm hover:underline">Add your first expense →</Link>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
                    labelFormatter={(label) => `${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {pieData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-gray-700">{c.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">₹{c.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-teal-600 hover:text-teal-700">View All</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-3">🧾</span>
              <p className="text-sm">No transactions yet</p>
              <Link to="/add-income" className="mt-3 text-teal-600 text-sm hover:underline">Add your first income →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${tx.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                      {tx.icon || CATEGORY_ICONS[tx.category] || "💰"}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tx.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}