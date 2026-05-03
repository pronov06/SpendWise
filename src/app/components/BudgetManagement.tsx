import { useEffect, useState, useCallback } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, IndianRupee, Save } from "lucide-react";
import { budgetApi, transactionApi, userApi } from "@/app/services/api";
import { useNotifications } from "@/app/context/NotificationContext";

interface ApiBudget {
  _id: string;
  category: string;
  limit: number;
  period: string;
  color?: string;
  icon?: string;
  spent: number;
}

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "🍕", color: "bg-orange-500" },
  { name: "Transportation", icon: "🚗", color: "bg-blue-500" },
  { name: "Shopping", icon: "🛍️", color: "bg-pink-500" },
  { name: "Entertainment", icon: "🎬", color: "bg-purple-500" },
  { name: "Bills & Utilities", icon: "💡", color: "bg-yellow-500" },
  { name: "Health & Fitness", icon: "💊", color: "bg-green-500" },
  { name: "Education", icon: "📚", color: "bg-indigo-500" },
  { name: "Other", icon: "📌", color: "bg-gray-500" },
];

export function BudgetManagement() {
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentSpending, setCurrentSpending] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState<
    { id?: string; name: string; budget: number; spent: number; icon: string; color: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotifications();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Load User Profile for overall monthly budget
      const profile = await userApi.getProfile();
      setMonthlyBudget(profile.monthlyBudget || 0);

      // 2. Load Budgets from API
      const apiBudgets: ApiBudget[] = await budgetApi.getAll();

      // 3. Current month spending range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

      // 4. Fetch all transactions for the month
      const txData = await transactionApi.getAll({
        type: "expense",
        startDate: fmt(startOfMonth),
        endDate: fmt(endOfMonth),
        limit: "1000",
      });
      const transactions = txData.transactions || [];
      const totalSpent = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      setCurrentSpending(totalSpent);

      // 5. Merge API budgets with defaults
      const mapped = DEFAULT_CATEGORIES.map((cat) => {
        const existing = apiBudgets.find((b) => b.category === cat.name);
        const catSpent = transactions
          .filter((t: any) => t.category === cat.name)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        return {
          id: existing?._id,
          name: cat.name,
          budget: existing?.limit || 0,
          spent: catSpent,
          icon: cat.icon,
          color: cat.color,
        };
      });

      // Add any custom categories that aren't in defaults
      apiBudgets.forEach(b => {
        if (!DEFAULT_CATEGORIES.find(d => d.name === b.category)) {
          const catSpent = transactions
            .filter((t: any) => t.category === b.category)
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          mapped.push({
            id: b._id,
            name: b.category,
            budget: b.limit,
            spent: catSpent,
            icon: b.icon || "💰",
            color: b.color || "bg-teal-500"
          });
        }
      });

      setCategoryBudgets(mapped);
    } catch (e) {
      console.error("Budget load error:", e);
      setError("Unable to load budget data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const spendingPercentage = monthlyBudget > 0 ? (currentSpending / monthlyBudget) * 100 : 0;

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      // 1. Save overall monthly budget to user profile
      await userApi.updateProfile({ monthlyBudget });

      // 2. Save/Update category budgets
      await Promise.all(
        categoryBudgets.map(async (cat) => {
          if (cat.id) {
            // Update existing
            return budgetApi.update(cat.id, { limit: cat.budget });
          } else if (cat.budget > 0) {
            // Create new if limit was set
            return budgetApi.create({
              category: cat.name,
              limit: cat.budget,
              icon: cat.icon,
              color: cat.color
            });
          }
        })
      );

      addNotification({
        type: "success",
        title: "Budget Saved",
        message: "Your monthly budget settings have been synchronized.",
      });

      // Reload to get IDs for newly created budgets
      loadData();
    } catch (e: any) {
      setError(e.message || "Failed to save budget settings");
      addNotification({
        type: "error",
        title: "Save Failed",
        message: "Could not save your budget settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-sm text-gray-500">Plan and track your spending</p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Monthly Limit</h2>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <IndianRupee className="w-5 h-5 text-teal-600" />
              <input
                type="number"
                value={monthlyBudget || ""}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                placeholder="Set limit"
                className="w-24 bg-transparent font-bold text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-teal-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/40 p-6 rounded-2xl border border-teal-100/50 dark:border-teal-800/50">
              <div>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">Spent so far</p>
                <p className="text-3xl font-black text-gray-900">
                  ₹{currentSpending.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">Remaining</p>
                <p className={`text-3xl font-black ${monthlyBudget - currentSpending < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₹{Math.abs(monthlyBudget - currentSpending).toLocaleString("en-IN")}
                  <span className="text-xs ml-1 font-normal uppercase">
                    {monthlyBudget - currentSpending < 0 ? 'Over' : 'Left'}
                  </span>
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between text-xs font-bold text-teal-800 dark:text-teal-300 mb-2">
                  <span>Usage Strategy</span>
                  <span>{spendingPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden border border-teal-100">
                  <div
                    className={`h-full transition-all duration-1000 ${spendingPercentage > 100 ? 'bg-red-500' :
                        spendingPercentage > 85 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                    style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6">Efficiency Pulse</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Your current spending velocity suggests you will use
              <span className="text-teal-400 font-bold mx-1">
                {spendingPercentage > 100 ? "more than" : "about"} {spendingPercentage.toFixed(0)}%
              </span>
              of your budget this month.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-sm font-bold">{spendingPercentage > 100 ? "Exceeded" : spendingPercentage > 85 ? "Critical" : "Healthy"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Daily Burn Rate</p>
                  <p className="text-sm font-bold">₹{(currentSpending / (new Date().getDate())).toFixed(0)} / day</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-500 opacity-5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl animate-pulse" />
          ))
        ) : (
          categoryBudgets.map((cat) => {
            const allocationPct = monthlyBudget > 0 ? (cat.budget / monthlyBudget) * 100 : 0;
            const spentPct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;

            return (
              <div key={cat.name} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${cat.color} bg-opacity-10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">₹{cat.spent.toLocaleString()} / ₹{cat.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 flex items-center px-3 py-2 rounded-xl border border-gray-100 group-hover:border-teal-200 transition-colors">
                    <span className="text-xs font-bold text-gray-400 mr-2">Limit:</span>
                    <input
                      type="number"
                      value={cat.budget || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCategoryBudgets(prev => prev.map(p => p.name === cat.name ? { ...p, budget: val } : p));
                      }}
                      className="w-20 bg-transparent text-right font-black text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {/* BAR 1: Allocation relative to total */}
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                      <span>Total Allocation</span>
                      <span>{allocationPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} opacity-40 transition-all duration-700`}
                        style={{ width: `${Math.min(allocationPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* BAR 2: Spending relative to category limit */}
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">
                      <span>Spending Progress</span>
                      <span className={spentPct > 100 ? 'text-red-500' : 'text-gray-900'}>{spentPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${spentPct > 100 ? 'bg-red-500' : cat.color} transition-all duration-1000 shadow-sm`}
                        style={{ width: `${Math.min(spentPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {spentPct >= 80 && (
                  <div className={`mt-4 p-2 rounded-xl flex items-center gap-2 ${spentPct >= 100 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase">{spentPct >= 100 ? 'Limit Exceeded' : 'Approaching Limit'}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}