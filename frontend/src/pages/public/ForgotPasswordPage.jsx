import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Lock, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── 6-box OTP input ─────────────────────────────────────────────────
function OTPInput({ value, onChange }) {
  const inputs = useRef([]);

  function handleChange(i, e) {
    const val = e.target.value.replace(/\D/, "");
    const arr = value.split("");
    arr[i] = val.slice(-1);
    onChange(arr.join(""));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, ""));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2
                     border-slate-200 bg-slate-50 text-slate-900
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                     transition-colors"
        />
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // step: "email" | "otp" | "password" | "done"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // countdown timer for resend
  function startResendTimer() {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  // ── Step 1: send OTP ──
  async function handleSendOTP(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("otp");
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify OTP ──
  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: reset password ──
  async function handleResetPassword(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ──
  async function handleResend() {
    if (resendTimer > 0) return;
    setError("");
    setOtp("");
    try {
      await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startResendTimer();
    } catch {
      setError("Failed to resend OTP. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <span
          className="font-bold text-xl text-slate-900"
          style={{ fontFamily: "Poppins" }}
        >
          BookEase
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 w-full max-w-md">
        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-blue-600" />
            </div>
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "Poppins" }}
            >
              Forgot your password?
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              No worries — enter your email and we'll send you a 6-digit OTP to
              reset your password.
            </p>
            <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                             text-slate-900 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold
                           hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
            </form>
            <Link
              to="/login"
              className="block text-center text-sm text-slate-500 hover:text-slate-700 mt-6"
            >
              ← Back to sign in
            </Link>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === "otp" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <span className="text-2xl">📧</span>
            </div>
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "Poppins" }}
            >
              Enter OTP
            </h1>
            <p className="text-slate-500 text-sm mb-2">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-slate-800 text-sm mb-8">{email}</p>

            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
              <OTPInput value={otp} onChange={setOtp} />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold
                           hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500 mb-1">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>

            <button
              onClick={() => {
                setStep("email");
                setError("");
                setOtp("");
              }}
              className="block text-center text-sm text-slate-500 hover:text-slate-700 mt-4 w-full"
            >
              ← Change email
            </button>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === "password" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "Poppins" }}
            >
              Set new password
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              OTP verified. Enter your new password below.
            </p>
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                             text-slate-900 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                             text-slate-900 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold
                           hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password →"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "Poppins" }}
            >
              Password updated!
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold
                         hover:bg-blue-700 transition-colors"
            >
              Go to Login →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
