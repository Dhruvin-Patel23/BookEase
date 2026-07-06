import { useState } from "react";
import {
  Calendar,
  User,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Btn from "../../components/common/Btn";
import api from "../../api/client";

const ROLES = [
  { key: "client", label: "Client", sub: "Book services", icon: User },
  {
    key: "provider",
    label: "Provider",
    sub: "Offer services",
    icon: Briefcase,
  },
];

export default function LoginPage() {
  const [role, setRole] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      window.location.href =
        role === "provider" ? "/provider/dashboard" : "/dashboard";
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div
        className="relative hidden md:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #2563eb 0%, #4338ca 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: "Poppins" }}>
            BookEase
          </span>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=580&h=420&fit=crop&auto=format"
            alt="Provider at work"
            className="rounded-2xl shadow-2xl w-full object-cover mb-10"
          />
          <h1
            className="text-4xl font-extrabold leading-tight mb-3"
            style={{ fontFamily: "Poppins" }}
          >
            Your time, perfectly managed.
          </h1>
          <p className="text-blue-100 mb-8">
            Thousands trust BookEase every day to coordinate appointments
            without friction.
          </p>
          <div className="flex items-center gap-6 text-blue-100 text-sm">
            <span>✓ Free to start</span>
            <span>✓ No credit card</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>

        <p className="text-blue-200 text-sm">© 2026 BookEase, Inc.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center px-8 sm:px-16 py-12">
        <a
          href="/"
          className="text-slate-500 hover:text-slate-700 text-sm mb-8 inline-flex items-center gap-1"
        >
          ← Back to home
        </a>

        <h2
          className="text-3xl font-bold text-slate-900 mb-1"
          style={{ fontFamily: "Poppins" }}
        >
          Welcome back
        </h2>
        <p className="text-slate-500 mb-8">Sign in to continue to BookEase</p>

        <form onSubmit={handleSubmit} className="max-w-md w-full">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Continue as
          </label>
          <div className="grid grid-cols-2 gap-3 mb-7">
            {ROLES.map(({ key, label, sub, icon: Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => setRole(key)}
                className={`rounded-2xl border-2 p-4 text-center transition-colors ${
                  role === key
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mx-auto mb-2 ${role === key ? "text-blue-600" : "text-slate-400"}`}
                />
                <div className="font-semibold text-slate-900">{label}</div>
                <div className="text-slate-400 text-sm">{sub}</div>
              </button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 mb-5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-900">
              Password
            </label>
          </div>

          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="text-right mb-6">
            <a
              href="/forgot-password"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <Btn
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="!w-full !bg-blue-600 !text-white hover:!bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Btn>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up free
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
