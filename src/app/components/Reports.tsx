import { useEffect, useMemo, useState } from "react";
import { Calendar, TrendingUp, TrendingDown, IndianRupee, PieChart, Download, FileText, File } from "lucide-react";
import { reportsApi } from "@/app/services/api";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
}

interface CategoryPoint {
  category: string;
  amount: number;
}

export function Reports() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [summary, setSummary] = useState<{ monthlyIncome: number; monthlyExpense: number; balance: number } | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyPoint[]>([]);
  const [categories, setCategories] = useState<CategoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<"month" | "year" | "custom">("month");
  const [hasApplied, setHasApplied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.export-menu')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Apply selected preset to date controls (default month)
  useEffect(() => {
    const today = new Date();
    let calculatedStart = "";
    let calculatedEnd = "";

    if (preset === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      calculatedStart = start.toISOString().split("T")[0];
      calculatedEnd = end.toISOString().split("T")[0];
    } else if (preset === "year") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      calculatedStart = start.toISOString().split("T")[0];
      calculatedEnd = end.toISOString().split("T")[0];
    } else if (preset === "custom") {
      // For custom, just set default dates but don't auto-load
      if (!startDate || !endDate) {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        calculatedStart = start.toISOString().split("T")[0];
        calculatedEnd = end.toISOString().split("T")[0];
      }
      return; // Don't auto-load for custom
    }

    if (calculatedStart && calculatedEnd) {
      setStartDate(calculatedStart);
      setEndDate(calculatedEnd);
      loadReports(calculatedStart, calculatedEnd);
    }
  }, [preset]);

  const loadReports = async (forcedStartDate?: string, forcedEndDate?: string) => {
    const queryStartDate = forcedStartDate || startDate;
    const queryEndDate = forcedEndDate || endDate;
    if (!queryStartDate || !queryEndDate) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);
    setCategories([]);
    setMonthlyTrend([]);

    try {
      const [summaryData, categoryData, trendData] = await Promise.all([
        reportsApi.getSummary({ startDate: queryStartDate, endDate: queryEndDate }),
        reportsApi.getCategoryBreakdown({ startDate: queryStartDate, endDate: queryEndDate }),
        reportsApi.getMonthlyTrend({ startDate: queryStartDate, endDate: queryEndDate }),
      ]);

      setSummary(summaryData);
      setCategories(categoryData);
      setMonthlyTrend(trendData);
      setHasApplied(true);
    } catch (e) {
      console.error("Reports load error:", e);
      setError("Unable to load reports. Please try again later.");
      setHasApplied(false);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!summary || !categories.length) return;

    const headers = ['Category', 'Amount', 'Percentage (%)'];
    const rows = categories.map(cat => [
      cat.category,
      cat.amount.toFixed(2),
      Math.round((cat.amount / categoryTotal) * 100) + '%'
    ]);

    // Add summary row
    rows.push(['', '', '']);
    rows.push(['Total Income', `${totalIncome.toFixed(2)}`, '']);
    rows.push(['Total Expenses', `${totalExpenses.toFixed(2)}`, '']);
    rows.push(['Net Savings', `${savings.toFixed(2)}`, '']);
    rows.push(['Savings Rate', `${savingsRate}%`, '']);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `spendwise-report-${startDate}-to-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!summary || !categories.length) return;
  
    const doc = new jsPDF();
  
    // ================= HEADER =================
    doc.setFillColor(20, 184, 166); // teal
    doc.rect(0, 0, 210, 25, "F");
  
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("SpendWise Financial Report", 14, 16);
  
    doc.setFontSize(10);
    doc.text("Smart Expense Tracking System", 14, 22);
  
    // Reset color
    doc.setTextColor(0, 0, 0);
  
    // ================= META INFO =================
    doc.setFontSize(11);
    doc.text(
      `Report Period: ${new Date(startDate || "").toLocaleDateString()} - ${new Date(endDate || "").toLocaleDateString()}`,
      14,
      35
    );
  
    doc.text(
      `Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      14,
      42
    );
  
    // ================= SUMMARY =================
    doc.setFontSize(14);
    doc.setFont("", "bold");
    doc.text("Financial Summary", 14, 55);
  
    const summaryData = [
      ["Total Income", `Rs. ${totalIncome.toLocaleString("en-IN")}`],
      ["Total Expenses", `Rs. ${totalExpenses.toLocaleString("en-IN")}`],
      ["Net Savings", `Rs. ${savings.toLocaleString("en-IN")}`],
      ["Savings Rate", `${savingsRate}%`],
    ];
  
    autoTable(doc, {
      startY: 60,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: 255,
        fontStyle: "bold",
      },
    });
  
    // ================= CATEGORY =================
    let y = (doc as any).lastAutoTable.finalY + 15;
  
    doc.setFontSize(14);
    doc.setFont("", "bold");
    doc.text("Expense Breakdown", 14, y);
  
    const categoryData = categories.map((cat) => [
      cat.category,
      `Rs. ${cat.amount.toLocaleString("en-IN")}`,
      `${Math.round((cat.amount / categoryTotal) * 100)}%`,
    ]);
  
    autoTable(doc, {
      startY: y + 5,
      head: [["Category", "Amount", "Percentage"]],
      body: categoryData,
      theme: "striped",
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
  
    // ================= TREND =================
    if (monthlyTrend.length > 0) {
      y = (doc as any).lastAutoTable.finalY + 15;
  
      doc.setFontSize(14);
      doc.setFont("", "bold");
      doc.text("Monthly Income vs Expenses", 14, y);
  
      const trendData = monthlyTrend.map((t) => [
        monthLabel(t.month),
        `Rs. ${t.income.toLocaleString("en-IN")}`,
        `Rs. ${t.expense.toLocaleString("en-IN")}`,
      ]);
  
      autoTable(doc, {
        startY: y + 5,
        head: [["Month", "Income", "Expenses"]],
        body: trendData,
        theme: "striped",
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: 255,
        },
      });
    }
  
    // ================= FOOTER =================
    const pageHeight = doc.internal.pageSize.height;
  
    doc.setDrawColor(200);
    doc.line(14, pageHeight - 20, 196, pageHeight - 20);
  
    doc.setFontSize(9);
    doc.setTextColor(100);
  
    doc.text(
      "This report is generated for personal financial analysis purposes only.",
      14,
      pageHeight - 12
    );
  
    doc.text(
      "© SpendWise | Smart Money Management",
      14,
      pageHeight - 6
    );
  
    // ================= SAVE =================
    doc.save(`SpendWise_Report_${startDate}_to_${endDate}.pdf`);
  };


  const totalIncome = summary?.monthlyIncome ?? 0;
  const totalExpenses = summary?.monthlyExpense ?? 0;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : "0.0";
  const showData = hasApplied && !isLoading;

  const categoryTotal = useMemo(
    () => categories.reduce((sum, c) => sum + c.amount, 0),
    [categories]
  );

  const categoryBreakdown = useMemo(
    () =>
      categories.map((c, idx) => ({
        category: c.category,
        amount: c.amount,
        percentage: categoryTotal ? Math.round((c.amount / categoryTotal) * 100) : 0,
        color: ["bg-orange-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-gray-500"][
          idx % 6
        ],
      })),
    [categories, categoryTotal]
  );

  const monthLabel = (value: string) => {
    // API returns "YYYY-MM"; show "MMM"
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Reports</h1>
            <p className="text-gray-600">Track your spending patterns and financial health</p>
          </div>
          <div className="flex gap-3">
            <div className="relative export-menu">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={!hasApplied || isLoading}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Export</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <button
                    onClick={() => {
                      exportToCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 first:rounded-t-xl"
                  >
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Export as CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      exportToPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 last:rounded-b-xl"
                  >
                    <File className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700">Export as PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setPreset("month")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                preset === "month"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => setPreset("year")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                preset === "year"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Year
            </button>

            <button
              onClick={() => setPreset("custom")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                preset === "custom"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Custom
            </button>
          </div>

          {preset === "custom" && (
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setHasApplied(false);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setHasApplied(false);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>

              <button
                onClick={() => loadReports()}
                disabled={!startDate || !endDate || isLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Apply"}
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total Income</p>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "Loading..." : showData ? `₹${totalIncome.toLocaleString("en-IN")}` : "—"}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Current month income
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "Loading..." : showData ? `₹${totalExpenses.toLocaleString("en-IN")}` : "—"}
            </p>
            <p className="text-sm text-red-600 mt-1">Current month expenses</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total Savings</p>
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "Loading..." : showData ? `₹${savings.toLocaleString("en-IN")}` : "—"}
            </p>
            <p className="text-sm text-teal-600 mt-1">Income minus expenses (this month)</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Savings Rate</p>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "—" : showData ? `${savingsRate}%` : "—"}
            </p>
            <p className="text-sm text-blue-600 mt-1">Savings rate for this month</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Income vs Expenses</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            {!hasApplied ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-500">
                Please select a period and click Apply to load report data.
              </div>
            ) : monthlyTrend.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-500">
                No trend data yet for this period.
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyTrend.map((data) => {
                  const maxValue = Math.max(
                    ...monthlyTrend.map((d) => Math.max(d.income, d.expense))
                  );
                  const incomeWidth = maxValue ? (data.income / maxValue) * 100 : 0;
                  const expenseWidth = maxValue ? (data.expense / maxValue) * 100 : 0;

                  return (
                    <div key={data.month}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">{monthLabel(data.month)}</span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-green-600">₹{data.income.toFixed(0)}</span>
                          <span className="text-red-600">₹{data.expense.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                            style={{ width: `${incomeWidth}%` }}
                          />
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                            style={{ width: `${expenseWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Expense by Category</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            {!hasApplied ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-500">
                Please select a period and click Apply to view category breakdown.
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-500">
                No expense categories yet for this period.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <span className="font-medium text-gray-700">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{cat.percentage}%</span>
                        <span className="font-semibold text-gray-900">
                          ₹{cat.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${cat.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Expenses</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹{categoryTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-4">💡 Financial Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm mb-1 opacity-90">Top Spending Category</p>
              {categoryBreakdown[0] ? (
                <>
                  <p className="text-lg font-bold">
                    {categoryBreakdown[0].category} - ₹
                    {categoryBreakdown[0].amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    {categoryBreakdown[0].percentage}% of this month&apos;s expenses
                  </p>
                </>
              ) : (
                <p className="text-sm opacity-80">No spending data yet.</p>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm mb-1 opacity-90">Current Month Savings</p>
              <p className="text-lg font-bold">
                ₹{savings.toLocaleString("en-IN")} ({savingsRate}%)
              </p>
              <p className="text-xs opacity-75 mt-1">
                Income minus expenses for the selected period.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm mb-1 opacity-90">Average Monthly Expense (last 6)</p>
              <p className="text-lg font-bold">
                ₹
                {monthlyTrend.length === 0
                  ? "0"
                  : Math.round(
                      monthlyTrend.reduce((sum, m) => sum + m.expense, 0) /
                        monthlyTrend.length
                    ).toLocaleString("en-IN")}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Based on your last {monthlyTrend.length} months of data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}