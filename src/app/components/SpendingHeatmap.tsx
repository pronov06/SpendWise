import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { heatmapApi } from "@/app/services/api";

interface DayData {
  date: Date;
  amount: number;
  transactions: number;
  categories: { name: string; amount: number }[];
}

export function SpendingHeatmap() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [spendingData, setSpendingData] = useState<Map<string, DayData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const makeDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  // Load real heatmap data from API
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data: { date: string; amount: number; count: number }[] = await heatmapApi.get();
        const map = new Map<string, DayData>();
        data.forEach((item) => {
          const date = new Date(item.date);
          const dateObj = new Date(item.date);
          const key = makeDateKey(dateObj);
          map.set(key, {
            date,
            amount: item.amount,
            transactions: item.count,
            categories: [],
          });
        });
        setSpendingData(map);
      } catch (e) {
        console.error("Heatmap load error:", e);
        setError("Unable to load spending heatmap. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Get color intensity based on spending amount
  const getColorIntensity = (amount: number): string => {
    if (amount === 0) return "bg-gray-100";
    if (amount < 200) return "bg-teal-100";
    if (amount < 500) return "bg-teal-200";
    if (amount < 1000) return "bg-teal-400";
    if (amount < 1500) return "bg-teal-600";
    return "bg-teal-800";
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const dateKey = makeDateKey(date);
    const dayData = spendingData.get(dateKey);
    
    if (dayData) {
      setSelectedDay(dayData);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate statistics
  const monthTotal = days.reduce((sum, day) => {
    const date = new Date(year, month, day);
    const dateKey = makeDateKey(date);
    const dayData = spendingData.get(dateKey);
    return sum + (dayData?.amount || 0);
  }, 0);

  const monthAvg = monthTotal / daysInMonth;

  const maxDay = days.reduce((max, day) => {
    const date = new Date(year, month, day);
    const dateKey = makeDateKey(date);
    const dayData = spendingData.get(dateKey);
    const amount = dayData?.amount || 0;
    return amount > (max.amount || 0) ? { day, amount } : max;
  }, { day: 0, amount: 0 });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Spending Heatmap</h1>
              <p className="text-gray-600">Visualize your daily spending patterns</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total This Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "Loading..." : `₹${monthTotal.toFixed(2)}`}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "Loading..." : `₹${monthAvg.toFixed(2)}`}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Highest Spending Day</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading || maxDay.day === 0 ? "N/A" : `${monthNames[month]} ${maxDay.day}`}
            </p>
            {!isLoading && maxDay.amount > 0 && (
              <p className="text-sm text-gray-600">₹{maxDay.amount.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const date = new Date(year, month, day);
              const dateKey = makeDateKey(date);
              const dayData = spendingData.get(dateKey);
              const amount = dayData?.amount || 0;
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg ${getColorIntensity(amount)} 
                    hover:ring-2 hover:ring-teal-500 transition-all relative group
                    ${isToday ? "ring-2 ring-emerald-500" : ""}
                    ${amount === 0 ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex flex-col items-center justify-center h-full p-1">
                    <span className={`text-sm font-semibold ${
                      amount > 1000 ? "text-white" : "text-gray-700"
                    }`}>
                      {day}
                    </span>
                    {amount > 0 && (
                      <span className={`text-xs ${
                        amount > 1000 ? "text-white/90" : "text-gray-600"
                      }`}>
                        ₹{amount > 1000 ? `${(amount/1000).toFixed(1)}k` : amount}
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  {amount > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                        ₹{amount.toFixed(2)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Spending Intensity</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gray-100 rounded"></div>
                <span className="text-xs text-gray-600">₹0</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-teal-100 rounded"></div>
                <span className="text-xs text-gray-600">₹1-200</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-teal-200 rounded"></div>
                <span className="text-xs text-gray-600">₹200-500</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-teal-400 rounded"></div>
                <span className="text-xs text-gray-600">₹500-1k</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-teal-600 rounded"></div>
                <span className="text-xs text-gray-600">₹1k-1.5k</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-teal-800 rounded"></div>
                <span className="text-xs text-gray-600">₹1.5k+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedDay.date.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <p className="text-sm text-teal-700 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-teal-900">₹{selectedDay.amount.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Transactions</p>
                  <p className="text-xl font-bold text-gray-900">{selectedDay.transactions}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Avg per Transaction</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{(selectedDay.amount / selectedDay.transactions).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedDay.categories.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {selectedDay.categories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">{cat.name}</span>
                        <span className="font-semibold text-gray-900">₹{cat.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
