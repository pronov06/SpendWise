import { useState, useCallback, useEffect } from "react";
import {
  expenseApi,
  incomeApi,
  budgetApi,
  groupApi,
  groupApi as groupExpenseApi,
  feedbackApi,
} from "./api";

// ─── Generic useAsync hook ────────────────────────────────
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus("error");
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  // Execute immediately on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { execute, reset, status, data, error };
}

// ═══════════════════════════════════════════════════════════
// ─── EXPENSE HOOKS ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export function useExpenses(limit = 50, category?: string) {
  const fetchExpenses = useCallback(
    () => expenseApi.getAll({ limit, page: 1, ...(category && { category }) }),
    [limit, category]
  );
  return useAsync(fetchExpenses, true);
}

export function useExpensesByCategory(startDate?: string, endDate?: string) {
  const fetchByCategory = useCallback(
    () => expenseApi.byCategory({ ...(startDate && { startDate }), ...(endDate && { endDate }) }),
    [startDate, endDate]
  );
  return useAsync(fetchByCategory, true);
}

export function useCreateExpense() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const create = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await expenseApi.create(payload);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  return { create, status, error, data };
}

export function useUpdateExpense(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await expenseApi.update(id, payload);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { update, status, error };
}

export function useDeleteExpense(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async () => {
    setStatus("pending");
    setError(null);
    try {
      await expenseApi.delete(id);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { remove, status, error };
}

// ═══════════════════════════════════════════════════════════
// ─── INCOME HOOKS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export function useIncomes(limit = 50, category?: string) {
  const fetchIncomes = useCallback(
    () => incomeApi.getAll({ limit, page: 1, ...(category && { category }) }),
    [limit, category]
  );
  return useAsync(fetchIncomes, true);
}

export function useIncomesByCategory(startDate?: string, endDate?: string) {
  const fetchByCategory = useCallback(
    () => incomeApi.byCategory({ ...(startDate && { startDate }), ...(endDate && { endDate }) }),
    [startDate, endDate]
  );
  return useAsync(fetchByCategory, true);
}

export function useCreateIncome() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const create = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await incomeApi.create(payload);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  return { create, status, error, data };
}

export function useUpdateIncome(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await incomeApi.update(id, payload);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { update, status, error };
}

export function useDeleteIncome(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async () => {
    setStatus("pending");
    setError(null);
    try {
      await incomeApi.delete(id);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { remove, status, error };
}

// ═══════════════════════════════════════════════════════════
// ─── BUDGET HOOKS ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export function useBudgets() {
  const fetchBudgets = useCallback(() => budgetApi.getAll(), []);
  return useAsync(fetchBudgets, true);
}

export function useCreateBudget() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const create = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await budgetApi.create(payload);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  return { create, status, error, data };
}

export function useUpdateBudget(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await budgetApi.update(id, payload);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { update, status, error };
}

export function useDeleteBudget(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async () => {
    setStatus("pending");
    setError(null);
    try {
      await budgetApi.delete(id);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { remove, status, error };
}

// ═══════════════════════════════════════════════════════════
// ─── GROUP HOOKS ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export function useGroups() {
  const fetchGroups = useCallback(() => groupApi.getAll(), []);
  return useAsync(fetchGroups, true);
}

export function useCreateGroup() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const create = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await groupApi.create(payload);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  return { create, status, error, data };
}

export function useAddGroupMember(groupId: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const addMember = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await groupApi.addMember(groupId, payload);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [groupId]);

  return { addMember, status, error };
}

export function useRemoveGroupMember(groupId: string, memberId: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const removeMember = useCallback(async () => {
    setStatus("pending");
    setError(null);
    try {
      await groupApi.removeMember(groupId, memberId);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [groupId, memberId]);

  return { removeMember, status, error };
}


export function useGroupExpenses() {
  const fetchGroupExpenses = useCallback(() => groupExpenseApi.getAll(), []);
  return useAsync(fetchGroupExpenses, true);
}

export function useGroupExpenseById(id: string) {
  const fetchGroupExpense = useCallback(() => groupExpenseApi.getById(id), [id]);
  return useAsync(fetchGroupExpense, true);
}

export function useCreateGroupExpense() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const create = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await groupExpenseApi.create(payload);
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  return { create, status, error, data };
}

export function useAddGroupExpense(groupId: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const addExpense = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await groupExpenseApi.addExpense(groupId, payload);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [groupId]);

  return { addExpense, status, error };
}

export function useAddGroupExpenseMember(groupId: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const addMember = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      const result = await groupExpenseApi.addMember(groupId, payload);
      setStatus("success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [groupId]);

  return { addMember, status, error };
}

export function useDeleteGroupExpenseItem(groupId: string, expenseId: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const deleteExpense = useCallback(async () => {
    setStatus("pending");
    setError(null);
    try {
      await groupExpenseApi.deleteExpense(groupId, expenseId);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [groupId, expenseId]);

  return { deleteExpense, status, error };
}

export function useDeleteGroupExpense(id: string) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const deleteGroup = useCallback(async () => {
    setStatus("pending");
    setError(null);
    try {
      await groupExpenseApi.delete(id);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [id]);

  return { deleteGroup, status, error };
}

// ═══════════════════════════════════════════════════════════
// ─── FEEDBACK HOOKS ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export function useSubmitFeedback() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(async (payload: any) => {
    setStatus("pending");
    setError(null);
    try {
      await feedbackApi.submit(payload);
      setStatus("success");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setStatus("error");
      throw error;
    }
  }, []);

  return { submit, status, error };
}
