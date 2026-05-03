import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Wallet, ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const email = (location.state as { email?: string })?.email || "";

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits"); return; }
    setError("");
    setIsLoading(true);
    try {
      await verifyOtp(email, code);
      navigate("/dashboard/user");
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp(email);
      setTimeLeft(600);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
            <p className="text-gray-600">
              We've sent a 6-digit OTP to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <p className="text-xs text-teal-600 mt-2 font-medium">
              💡 Check the server console for your OTP
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i} ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-semibold bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Code expires in{" "}
                <span className={`font-medium ${timeLeft < 60 ? "text-red-600" : "text-gray-900"}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
              {timeLeft === 0 ? (
                <button type="button" onClick={handleResend} disabled={isResending}
                  className="mt-2 text-teal-600 hover:text-teal-700 font-medium text-sm">
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Didn't receive it?{" "}
                  <button type="button" onClick={handleResend} disabled={isResending}
                    className="text-teal-600 hover:text-teal-700 font-medium">
                    {isResending ? "Sending..." : "Resend"}
                  </button>
                </p>
              )}
            </div>

            <button type="submit" disabled={isLoading || otp.join("").length < 6}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-60">
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
