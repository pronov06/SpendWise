import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Wallet,
  Home,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bell,
  Plus,
  MessageSquare,
  Calendar,
  UsersRound,
  User,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard/user" },
    { icon: TrendingUp, label: "Transactions", path: "/transactions" },
    { icon: PieChart, label: "Budget", path: "/budget" },
    { icon: Calendar, label: "Spending Heatmap", path: "/spending-heatmap" },
    { icon: UsersRound, label: "Group Expenses", path: "/group-expenses" },
    { icon: ArrowUpRight, label: "Add Income", path: "/add-income" },
    { icon: ArrowDownLeft, label: "Add Expense", path: "/add-expense" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950">
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-40 transition-all duration-300 hidden md:flex flex-col ${isSidebarCollapsed ? "w-20" : "w-64"
          }`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`${isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"
                } bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center transition-all overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm`}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Wallet className={`${isSidebarCollapsed ? "w-5 h-5" : "w-6 h-6"} text-white`} />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">SpendWise</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personal</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full ${isSidebarCollapsed ? "justify-center" : ""
              }`}
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </aside>

      <header className="md:hidden bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">SpendWise</h1>
                <p className="text-xs text-gray-500">Personal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
              </div>
              <ThemeToggle />
              <Link
                to="/settings"
                className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-teal-500 transition-all group overflow-hidden flex items-center justify-center"
                title="Settings"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">SpendWise</h1>
                <p className="text-xs text-gray-500">Personal</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main
        className={`transition-all duration-300 relative ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
      >
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-end px-8 py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-30">
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-teal-500 transition-all group"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-teal-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          </div>
          <div className="ml-3">
            <ThemeToggle />
          </div>
          <Link
            to="/settings"
            className="ml-3 w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-teal-500 transition-all group overflow-hidden flex items-center justify-center"
            title="Settings"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
            )}
          </Link>
        </header>

        <Outlet />
      </main>

      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
        <Link
          to="/add-income"
          className="w-14 h-14 bg-gradient-to-r from-teal-500 to-emerald-600 hover:shadow-xl text-white rounded-full shadow-lg flex items-center justify-center transition-all group"
          title="Add Income"
        >
          <ArrowUpRight className="w-6 h-6" />
        </Link>
        <Link
          to="/add-expense"
          className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-xl text-white rounded-full shadow-lg flex items-center justify-center transition-all group"
          title="Add Expense"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
