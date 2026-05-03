import { useState, useEffect, type ReactNode } from "react";
import { User, Lock, Save, Camera, Bell, Shield, Mail, Phone, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { userApi } from "@/app/services/api";
import { useNotifications } from "@/app/context/NotificationContext";

type Profile = {
  name: string;
  phone: string;
  avatar: string;
  budgetAlerts: boolean;
  categoryAlerts: boolean;
  weeklySummary: boolean;
};

export function Settings() {
  const { user, setUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [profile, setProfile] = useState<Profile>({ 
    name: user?.name || "", 
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    budgetAlerts: user?.budgetAlerts ?? true,
    categoryAlerts: user?.categoryAlerts ?? true,
    weeklySummary: user?.weeklySummary ?? false
  });
  
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setProfile({ 
        name: user.name || "", 
        phone: user.phone || "",
        avatar: user.avatar || "",
        budgetAlerts: user.budgetAlerts ?? true,
        categoryAlerts: user.categoryAlerts ?? true,
        weeklySummary: user.weeklySummary ?? false
      });
    }
  }, [user]);

  const handleProfileSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await userApi.updateProfile(profile);
      setUser({ ...user!, ...updated });
      addNotification({
        type: "success",
        title: "Settings Saved",
        message: "Your profile and preferences have been updated successfully."
      });
    } catch (err: any) {
      addNotification({
        type: "error",
        title: "Update Failed",
        message: err.message || "Failed to update settings."
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification({
          type: "error",
          title: "File too large",
          message: "Please select an image smaller than 2MB."
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      addNotification({ type: "error", title: "Error", message: "Passwords do not match" });
      return;
    }
    if (passwords.newPass.length < 6) {
      addNotification({ type: "error", title: "Error", message: "Password must be at least 6 characters" });
      return;
    }
    setPassLoading(true);
    try {
      await userApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      setPasswords({ current: "", newPass: "", confirm: "" });
      addNotification({
        type: "success",
        title: "Success",
        message: "Password changed successfully!"
      });
    } catch (err: any) {
      addNotification({ type: "error", title: "Error", message: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  const togglePreference = (key: keyof Pick<Profile, "budgetAlerts" | "categoryAlerts" | "weeklySummary">) => {
    setProfile(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-500" />
          Manage your personal information, security, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Security */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-10">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg flex items-center justify-center text-teal-600 hover:text-teal-700 transition-all hover:scale-110 cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" /> {user?.email}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase rounded-full tracking-wider border border-teal-100 dark:border-teal-500/20">Verified User</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {profileLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    {profileLoading ? "Saving Changes..." : "Save Profile Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-500/20">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Privacy</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Update your password to keep your account safe</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input 
                        type="password" 
                        value={passwords.current}
                        onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input 
                        type="password" 
                        value={passwords.newPass}
                        onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input 
                        type="password" 
                        value={passwords.confirm}
                        onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={passLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {passLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Lock className="w-5 h-5" />}
                    {passLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-500/20">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alert Center</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Keep track of your limits</p>
              </div>
            </div>

            <div className="space-y-6">
              {(
                [
                  { 
                    key: "budgetAlerts" as const,
                    label: "Budget Limit Alerts", 
                    desc: "Get notified when you reach 80% of your primary budget",
                    icon: <AlertTriangle className="w-5 h-5" />
                  },
                  { 
                    key: "categoryAlerts" as const,
                    label: "Category Alerts", 
                    desc: "Notifications for exceeding specific category limits",
                    icon: <CheckCircle className="w-5 h-5" />
                  },
                  { 
                    key: "weeklySummary" as const,
                    label: "Weekly Summary", 
                    desc: "Receive a detailed spending report every Monday",
                    icon: <Mail className="w-5 h-5" />
                  },
                ] satisfies { key: keyof Pick<Profile, "budgetAlerts" | "categoryAlerts" | "weeklySummary">; label: string; desc: string; icon: ReactNode }[]
              ).map((item) => (
                <div key={item.key} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-500/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={profile[item.key as keyof Profile] as boolean}
                        onChange={() => togglePreference(item.key)} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => handleProfileSave()}
                disabled={profileLoading}
                className="w-full py-4 bg-teal-50 text-teal-600 rounded-2xl font-bold hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
              >
                {profileLoading ? "Saving Preferences..." : "Sync Preferences"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

