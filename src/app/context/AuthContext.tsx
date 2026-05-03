import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/app/services/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user";
  phone?: string;
  budgetAlerts?: boolean;
  categoryAlerts?: boolean;
  weeklySummary?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: object) => Promise<{ userId: string; email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("spendwise_token");
    const storedUser = localStorage.getItem("spendwise_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await authApi.login({
      email,
      password,
    });
    console.log("LOGIN PAYLOAD:", { email, password });
    localStorage.setItem("spendwise_token", data.token);
    localStorage.setItem("spendwise_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData: object) => {
    return await authApi.register(formData);
  };

  const verifyOtp = async (email: string, otp: string) => {
    const data = await authApi.verifyOtp({ email, otp });
    localStorage.setItem("spendwise_token", data.token);
    localStorage.setItem("spendwise_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const resendOtp = async (email: string) => {
    await authApi.resendOtp({ email });
  };

  const logout = () => {
    localStorage.removeItem("spendwise_token");
    localStorage.removeItem("spendwise_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, verifyOtp, resendOtp, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
