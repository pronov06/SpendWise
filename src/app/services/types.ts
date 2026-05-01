// ─── User & Auth ───────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user";
  phone?: string;
  avatar?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
}

// ─── Expense ────────────────────────────────────────────────
export interface Expense {
  _id: string;
  userId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  tags: string[];
  icon: string;
  paymentMethod: string;
  isRecurring: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePayload {
  category: string;
  description: string;
  amount: number;
  date?: string;
  tags?: string[];
  icon?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  pages: number;
}

export interface ExpenseCategoryBreakdown {
  _id: string;
  total: number;
  count: number;
}

// ─── Income ─────────────────────────────────────────────────
export interface Income {
  _id: string;
  userId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  tags: string[];
  icon: string;
  source: string;
  isRecurring: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

export interface IncomePayload {
  category: string;
  description: string;
  amount: number;
  date?: string;
  tags?: string[];
  icon?: string;
  source?: string;
  isRecurring?: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface IncomeListResponse {
  incomes: Income[];
  total: number;
  page: number;
  pages: number;
}

export interface IncomeCategoryBreakdown {
  _id: string;
  total: number;
  count: number;
}

// ─── Budget ─────────────────────────────────────────────────
export interface Budget {
  _id: string;
  userId: string;
  category: string;
  limit: number;
  period: "weekly" | "monthly";
  color: string;
  icon: string;
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPayload {
  category: string;
  limit: number;
  period?: "weekly" | "monthly";
  color?: string;
  icon?: string;
}

// ─── Group ──────────────────────────────────────────────────
export interface GroupMember {
  _id: string;
  user?: any;
  name: string;
  email: string;
  isAdmin: boolean;
  joinedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: any;
  members: GroupMember[];
  icon: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupPayload {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface AddGroupMemberPayload {
  userId?: string;
  email?: string;
  name?: string;
}

// ─── Group Expense (Legacy) ─────────────────────────────────
export interface GroupExpenseItem {
  _id: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  splitAmong: string[];
  date: string;
  category: string;
}

export interface GroupExpense {
  _id: string;
  name: string;
  description: string;
  createdBy: any;
  members: GroupMember[];
  expenses: GroupExpenseItem[];
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupExpensePayload {
  name: string;
  description?: string;
  icon?: string;
}

export interface AddGroupExpensePayload {
  description: string;
  amount: number;
  category?: string;
  date?: string;
}

// ─── Feedback ───────────────────────────────────────────────
export interface Feedback {
  _id: string;
  userId: string;
  type: "bug" | "feature" | "general" | "praise";
  message: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackPayload {
  type?: "bug" | "feature" | "general" | "praise";
  message: string;
  rating?: number;
}

// ─── API Response Wrapper ───────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// ─── Query Params ────────────────────────────────────────────
export interface ListQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}
