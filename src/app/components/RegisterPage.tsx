import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Wallet, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter (A-Z)";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter (a-z)";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number (0-9)";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*, etc.)";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const res = await register(formData);
      navigate("/otp", { state: { email: res.email } });
    } catch (err: unknown) {
      setError((err as Error).message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900">SpendWise</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Start your journey to financial freedom</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "name", icon: User, type: "text", placeholder: "Full Name", field: "name" },
              { id: "email", icon: Mail, type: "email", placeholder: "Email Address", field: "email" },
              { id: "phone", icon: Phone, type: "tel", placeholder: "Phone Number", field: "phone" },
              { id: "password", icon: Lock, type: "password", placeholder: "Password (min 8 chars, uppercase, number, special char)", field: "password" },
              { id: "confirmPassword", icon: Lock, type: "password", placeholder: "Confirm Password", field: "confirmPassword" },
            ].map(({ id, icon: Icon, type, placeholder, field }) => (
              <div key={id} className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required={field !== "phone"}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-60 mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">Sign in</Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-teal-600">→ Back to home</Link>
        </div>
      </div>
    </div>
  );
}
