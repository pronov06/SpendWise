import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/app/components/LandingPage";
import { LoginPage } from "@/app/components/LoginPage";
import { RegisterPage } from "@/app/components/RegisterPage";
import { OTPPage } from "@/app/components/OTPPage";
import { UserDashboard } from "@/app/components/UserDashboard";
import { AddIncome } from "@/app/components/AddIncome";
import { AddExpense } from "@/app/components/AddExpense";
import { BudgetManagement } from "@/app/components/BudgetManagement";
import { Transactions } from "@/app/components/Transactions";
import { Reports } from "@/app/components/Reports";
import { Feedback } from "@/app/components/Feedback";
import { SpendingHeatmap } from "@/app/components/SpendingHeatmap";
import { GroupExpenses } from "@/app/components/GroupExpenses";
import { UserDashboardLayout } from "@/app/components/UserDashboardLayout";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { Settings } from "@/app/components/Settings";

// BUG-010 FIX: inline 404 page (no separate file needed, keeps it simple)
function NotFoundPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
      <p style={{ color: "#666" }}>Page not found</p>
      <a href="/" style={{ color: "#14b8a6", textDecoration: "none" }}>← Back to Home</a>
    </div>
  );
}

const guardedUserLayout = {
  element: (
    <ProtectedRoute>
      <UserDashboardLayout />
    </ProtectedRoute>
  ),
};

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage, ErrorBoundary },
  { path: "/login", Component: LoginPage, ErrorBoundary },
  { path: "/register", Component: RegisterPage, ErrorBoundary },
  { path: "/otp", Component: OTPPage, ErrorBoundary },

  { path: "/dashboard/user", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: UserDashboard }] },
  { path: "/add-income", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: AddIncome }] },
  { path: "/add-expense", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: AddExpense }] },
  { path: "/budget", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: BudgetManagement }] },
  { path: "/transactions", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: Transactions }] },
  { path: "/reports", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: Reports }] },
  { path: "/spending-heatmap", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: SpendingHeatmap }] },
  { path: "/group-expenses", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: GroupExpenses }] },
  { path: "/feedback", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: Feedback }] },
  { path: "/settings", ...guardedUserLayout, ErrorBoundary, children: [{ index: true, Component: Settings }] },
  // BUG-010 FIX: catch-all for undefined paths — prevents blank white screen
  { path: "*", Component: NotFoundPage },
]);

