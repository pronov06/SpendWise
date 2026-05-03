const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeaders = () => {
  const token = localStorage.getItem("spendwise_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || "Request failed"), data);
  return data;
};

export const authApi = {
  register: (body: object) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: object) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  verifyOtp: (body: object) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
  resendOtp: (body: object) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify(body) }),
};

// ─── EXPENSES ──────────────────────────────────────────────
export const expenseApi = {
  getAll: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : "";
    return request(`/expenses${qs}`);
  },
  getById: (id: string) => request(`/expenses/${id}`),
  byCategory: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/expenses/by-category${qs}`);
  },
  create: (body: object) => request("/expenses", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: object) => request(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id: string) => request(`/expenses/${id}`, { method: "DELETE" }),
};

// ─── INCOMES ───────────────────────────────────────────────
export const incomeApi = {
  getAll: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : "";
    return request(`/incomes${qs}`);
  },
  getById: (id: string) => request(`/incomes/${id}`),
  byCategory: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/incomes/by-category${qs}`);
  },
  create: (body: object) => request("/incomes", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: object) => request(`/incomes/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id: string) => request(`/incomes/${id}`, { method: "DELETE" }),
};

export const transactionApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/transactions${qs}`);
  },
  create: (body: object) => request("/transactions", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: object) => request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id: string) => request(`/transactions/${id}`, { method: "DELETE" }),
};

export const budgetApi = {
  getAll: () => request("/budget"),
  getById: (id: string) => request(`/budget/${id}`),
  create: (body: object) => request("/budget", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: object) => request(`/budget/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id: string) => request(`/budget/${id}`, { method: "DELETE" }),
};

// ─── GROUP EXPENSES ─────────────────────────────────────────
// Groups are stored in the 'groupexpenses' MongoDB collection.
// Group expenses are embedded within each group document.
export const groupApi = {
  getAll:        ()                              => request("/group-expenses"),
  getById:       (id: string)                    => request(`/group-expenses/${id}`),
  create:        (body: object)                  => request("/group-expenses", { method: "POST", body: JSON.stringify(body) }),
  addMember:     (id: string, body: object)      => request(`/group-expenses/${id}/add-member`, { method: "POST", body: JSON.stringify(body) }),
  addExpense:    (id: string, body: object)      => request(`/group-expenses/${id}/add-expense`, { method: "POST", body: JSON.stringify(body) }),
  deleteExpense: (groupId: string, expId: string) => request(`/group-expenses/${groupId}/expenses/${expId}`, { method: "DELETE" }),
  delete:        (id: string)                    => request(`/group-expenses/${id}`, { method: "DELETE" }),
  sendSplitEmails: (id: string, body: object)    => request(`/group-expenses/${id}/send-split-emails`, { method: "POST", body: JSON.stringify(body) }),
};

export const reportsApi = {
  getSummary: (params: { startDate: string; endDate: string }) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/summary?${qs}`);
  },

  getCategoryBreakdown: (params: { startDate: string; endDate: string }) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/category-breakdown?${qs}`);
  },

  getMonthlyTrend: (params: { startDate: string; endDate: string }) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reports/monthly-trend?${qs}`);
  },
};

export const heatmapApi = {
  get: () => request("/heatmap"),
};

export const feedbackApi = {
  submit: (body: object) => request("/feedback", { method: "POST", body: JSON.stringify(body) }),
};

export const userApi = {
  getProfile: () => request("/user/profile"),
  updateProfile: (body: object) => request("/user/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body: object) => request("/user/change-password", { method: "PUT", body: JSON.stringify(body) }),
};

export const chatApi = {
  sendMessage: (body: { message: string }) => request("/chat", { method: "POST", body: JSON.stringify(body) }),
};
