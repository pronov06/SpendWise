import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  UserPlus,
  ArrowRight,
  X,
  Receipt,
  Loader2,
  Mail,
  Check,
} from "lucide-react";
import { groupApi } from "@/app/services/api";

// ── Raw API shapes ────────────────────────────────────────────────────────────
interface ApiMember {
  _id: string;
  user?: string;
  name: string;
  email: string;
}

interface ApiExpense {
  _id: string;
  description: string;
  amount: number;
  paidBy?: string;
  paidByName?: string;
  date: string;
  category: string;
  splitAmong: string[];
}

interface ApiGroup {
  _id: string;
  name: string;
  description?: string;
  members: ApiMember[];
  expenses: ApiExpense[];
  createdAt: string;
}

// ── UI shapes ─────────────────────────────────────────────────────────────────
interface Member {
  id: string;   // subdoc _id (or user ObjectId if registered)
  name: string;
  email: string;
  avatar: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName?: string;
  date: string;
  category: string;
  splitAmong: string[];
}

interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

// ─── Map API → UI ─────────────────────────────────────────────────────────────
const mapApiGroupToGroup = (api: ApiGroup): Group => ({
  id: api._id,
  name: api.name,
  createdAt: api.createdAt,
  members: (api.members || []).map((m) => ({
    // Prefer the subdoc _id so balances always resolve correctly
    id: m._id,
    name: m.name || "Member",
    email: m.email || "",
    avatar: "👤",
  })),
  expenses: (api.expenses || []).map((e) => ({
    id: e._id,
    description: e.description,
    amount: e.amount,
    paidBy: (e.paidBy as string) || "",
    paidByName: e.paidByName,
    date: e.date,
    category: e.category,
    splitAmong: (e.splitAmong || []).map(String),
  })),
});

// ─── Component ────────────────────────────────────────────────────────────────
export function GroupExpenses() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newExpenseData, setNewExpenseData] = useState({
    description: "",
    amount: "",
    category: "General",
    date: new Date().toISOString().split("T")[0],
    paidByMemberId: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const refreshGroups = async () => {
    const apiGroups: ApiGroup[] = await groupApi.getAll();
    const mapped = apiGroups.map(mapApiGroupToGroup);
    setGroups(mapped);
    // Keep selected group in sync
    setSelectedGroup((prev) =>
      prev ? mapped.find((g) => g.id === prev.id) ?? null : null
    );
  };

  // ── Load on mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        await refreshGroups();
      } catch (e) {
        console.error("Group load error:", e);
        setError("Unable to load groups. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Balance helpers ──────────────────────────────────────────────────────────
  const calculateBalances = (group: Group) => {
    const balances: Record<string, number> = {};
    group.members.forEach((m) => (balances[m.id] = 0));

    group.expenses.forEach((expense) => {
      if (!expense.splitAmong.length) return;
      const share = expense.amount / expense.splitAmong.length;
      if (balances[expense.paidBy] !== undefined)
        balances[expense.paidBy] += expense.amount;
      expense.splitAmong.forEach((mid) => {
        if (balances[mid] !== undefined) balances[mid] -= share;
      });
    });

    return balances;
  };

  const getSettlements = (group: Group) => {
    const balances = { ...calculateBalances(group) };
    const settlements: { from: string; to: string; amount: number }[] = [];

    const creditors = Object.entries(balances).filter(([, v]) => v > 0.01);
    const debtors = Object.entries(balances).filter(([, v]) => v < -0.01);

    creditors.forEach(([cId]) => {
      debtors.forEach(([dId]) => {
        if (balances[cId] > 0.01 && balances[dId] < -0.01) {
          const settle = Math.min(balances[cId], Math.abs(balances[dId]));
          settlements.push({ from: dId, to: cId, amount: settle });
          balances[cId] -= settle;
          balances[dId] += settle;
        }
      });
    });

    return settlements;
  };

  const getMemberName = (group: Group, id: string) =>
    group.members.find((m) => m.id === id)?.name ?? id;

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      setIsSaving(true);
      setError(null);
      await groupApi.create({ name: newGroupName.trim(), description: "", icon: "👥" });
      await refreshGroups();
      setNewGroupName("");
      setShowCreateGroup(false);
    } catch (e: any) {
      console.error("Create group error:", e);
      setError(e?.message || "Failed to create group.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !newMemberName.trim() || !newMemberEmail.trim()) return;
    try {
      setIsSaving(true);
      setError(null);
      await groupApi.addMember(selectedGroup.id, {
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
      });
      await refreshGroups();
      setNewMemberName("");
      setNewMemberEmail("");
      setShowAddMember(false);
    } catch (e: any) {
      console.error("Add member error:", e);
      setError(e?.message || "Failed to add member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedGroup || !newExpenseData.description.trim() || !newExpenseData.amount) return;
    const amount = Number(newExpenseData.amount);
    if (amount <= 0) { setError("Amount must be greater than 0"); return; }

    try {
      setIsSaving(true);
      setError(null);
      await groupApi.addExpense(selectedGroup.id, {
        description: newExpenseData.description.trim(),
        amount,
        category: newExpenseData.category,
        date: newExpenseData.date,
        paidByMemberId: newExpenseData.paidByMemberId || undefined,
      });
      await refreshGroups();
      setNewExpenseData({
        description: "",
        amount: "",
        category: "General",
        date: new Date().toISOString().split("T")[0],
        paidByMemberId: "",
      });
      setShowAddExpense(false);
    } catch (e: any) {
      console.error("Add expense error:", e);
      setError(e?.message || "Failed to add expense.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!selectedGroup) return;
    if (!confirm("Delete this expense?")) return;
    try {
      setError(null);
      await groupApi.deleteExpense(selectedGroup.id, expenseId);
      await refreshGroups();
    } catch (e: any) {
      console.error("Delete expense error:", e);
      setError(e?.message || "Failed to delete expense.");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Delete this entire group? This cannot be undone.")) return;
    try {
      setError(null);
      await groupApi.delete(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setSelectedGroup(null);
    } catch (e: any) {
      console.error("Delete group error:", e);
      setError(e?.message || "Failed to delete group.");
    }
  };

  const selectedGroupBalances = useMemo(
    () => (selectedGroup ? calculateBalances(selectedGroup) : {}),
    [selectedGroup]
  );

  const handleSendEmails = async () => {
    if (!selectedGroup) return;
    try {
      setIsSendingEmails(true);
      setError(null);
      
      const settlements = getSettlements(selectedGroup).map(s => ({
        from: getMemberName(selectedGroup, s.from),
        to: getMemberName(selectedGroup, s.to),
        amount: s.amount
      }));
      
      const totalExpenses = selectedGroup.expenses.reduce((s, e) => s + e.amount, 0);
      
      await groupApi.sendSplitEmails(selectedGroup.id, {
        settlements,
        totalExpenses
      });
      
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (e: any) {
      console.error("Send emails error:", e);
      setError(e?.message || "Failed to send split emails.");
    } finally {
      setIsSendingEmails(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Group Expenses</h1>
                <p className="text-gray-600">Manage shared expenses with friends</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Group</span>
            </button>
          </div>
        </div>

        {/* Global error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {!selectedGroup ? (
          /* ── Groups List ─────────────────────────────────── */
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse space-y-4">
                    <div className="h-5 w-1/2 bg-gray-200 rounded" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-10 w-full bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Users className="w-10 h-10 text-teal-500 mb-3" />
                <h2 className="text-lg font-semibold text-gray-900 mb-1">No groups yet</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Create a group to start tracking shared expenses with friends and family.
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create your first group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => {
                  const totalExpenses = group.expenses.reduce((s, e) => s + e.amount, 0);
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{group.name}</h3>
                          <p className="text-sm text-gray-600">{group.members.length} member{group.members.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 3).map((m) => (
                            <div key={m.id} className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center border-2 border-white text-sm">
                              {m.avatar}
                            </div>
                          ))}
                          {group.members.length > 3 && (
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white text-xs font-semibold text-gray-600">
                              +{group.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                          <span className="text-sm text-gray-600">Total Expenses</span>
                          <span className="font-semibold text-gray-900">₹{totalExpenses.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Expenses logged</span>
                          <span className="text-sm font-medium text-teal-600">{group.expenses.length}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Group Details ───────────────────────────────── */
          <div>
            {/* Back */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>Back to Groups</span>
            </button>

            {/* Group Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGroup.name}</h2>
                  <p className="text-gray-600">{selectedGroup.members.length} member{selectedGroup.members.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDeleteGroup(selectedGroup.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete Group</span>
                  </button>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Expense</span>
                  </button>
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Members</h3>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedGroup.members.map((member) => {
                    const balance = selectedGroupBalances[member.id] || 0;
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                          <p className="text-xs text-gray-600 truncate">{member.email}</p>
                        </div>
                        {Math.abs(balance) > 0.01 && (
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${balance > 0 ? "text-green-600" : "text-red-600"}`}>
                              {balance > 0 ? "+" : "-"}₹{Math.abs(balance).toFixed(0)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Settlements */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Settlements</h3>
                {selectedGroup.expenses.length > 0 && (
                  <button
                    onClick={handleSendEmails}
                    disabled={isSendingEmails || emailSuccess}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      emailSuccess 
                        ? "bg-green-100 text-green-700" 
                        : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    }`}
                  >
                    {isSendingEmails ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : emailSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {emailSuccess ? "Emails Sent!" : "Send Split via Email"}
                  </button>
                )}
              </div>
              {getSettlements(selectedGroup).length > 0 ? (
                <div className="space-y-3">
                  {getSettlements(selectedGroup).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{getMemberName(selectedGroup, s.from)}</span>
                          {" owes "}
                          <span className="font-semibold">{getMemberName(selectedGroup, s.to)}</span>
                        </p>
                      </div>
                      <p className="text-lg font-bold text-amber-600">₹{s.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">All settled up! 🎉</p>
              )}
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Expenses</h3>
                <span className="text-sm text-gray-500">{selectedGroup.expenses.length} total</span>
              </div>
              {selectedGroup.expenses.length > 0 ? (
                <div className="space-y-3">
                  {selectedGroup.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-semibold text-gray-900">{expense.description}</p>
                            <span className="text-xs bg-teal-50 text-teal-700 rounded px-2 py-0.5">{expense.category}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="font-bold text-gray-900 whitespace-nowrap">₹{expense.amount.toFixed(2)}</p>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete expense"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Paid by {expense.paidByName || getMemberName(selectedGroup, expense.paidBy)}</span>
                          <span>•</span>
                          <span>{new Date(expense.date).toLocaleDateString("en-IN")}</span>
                        </div>
                        {expense.splitAmong.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Split among {expense.splitAmong.length} {expense.splitAmong.length === 1 ? "person" : "people"} • ₹{(expense.amount / expense.splitAmong.length).toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No expenses yet. Add your first expense!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Create Group Modal ─────────────────────────────────── */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Group</h3>
              <button onClick={() => setShowCreateGroup(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                  placeholder="e.g., Roommates, Trip to Goa..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={isSaving || !newGroupName.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Member Modal ───────────────────────────────────── */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Member</h3>
              <button onClick={() => setShowAddMember(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter member name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter member email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={handleAddMember}
                disabled={isSaving || !newMemberName.trim() || !newMemberEmail.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Expense Modal ──────────────────────────────────── */}
      {showAddExpense && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Expense to {selectedGroup.name}</h3>
              <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid by *</label>
                <select
                  value={newExpenseData.paidByMemberId}
                  onChange={(e) => setNewExpenseData((p) => ({ ...p, paidByMemberId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">— Select who paid —</option>
                  {selectedGroup.members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  value={newExpenseData.description}
                  onChange={(e) => setNewExpenseData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g., Dinner at restaurant"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  value={newExpenseData.amount}
                  onChange={(e) => setNewExpenseData((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newExpenseData.category}
                  onChange={(e) => setNewExpenseData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="General">General</option>
                  <option value="Food & Dining">Food &amp; Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newExpenseData.date}
                  onChange={(e) => setNewExpenseData((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={handleAddExpense}
                disabled={isSaving || !newExpenseData.description.trim() || !newExpenseData.amount}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
