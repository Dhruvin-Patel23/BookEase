import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, User, Briefcase, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function RoleCard({ role, label, sub, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(role)}
      className={`flex-1 flex flex-col items-center gap-1 py-5 px-4 rounded-2xl border-2 transition-all
        ${
          selected
            ? "border-blue-600 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
        }`}
    >
      <Icon
        className={`w-6 h-6 ${selected ? "text-blue-600" : "text-slate-400"}`}
      />
      <span className="font-semibold text-sm text-slate-900">{label}</span>
      <span className="text-xs">{sub}</span>
    </button>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-1.5"
      >
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                     text-slate-900 placeholder-slate-400 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      )}
    </div>
  );
}

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 text-white"
      style={{
        background: "linear-gradient(150deg, #1d4ed8 0%, #4338ca 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl" style={{ fontFamily: "Poppins" }}>
          BookEase
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=580&h=420&fit=crop&auto=format"
          alt="Medical professional"
          className="w-full object-cover"
        />
      </div>

      <div>
        <h2
          className="text-3xl font-extrabold mb-3"
          style={{ fontFamily: "Poppins" }}
        >
          Your time, perfectly managed.
        </h2>
        <p className="text-blue-100 text-sm mb-6">
          Thousands trust BookEase every day to coordinate appointments without
          friction.
        </p>
        <ul className="flex flex-col gap-1 text-blue-100 text-sm">
          <li>✓ Free to start</li>
          <li>✓ No credit card</li>
          <li>✓ Cancel anytime</li>
        </ul>
      </div>

      <p className="text-blue-200 text-xs">© 2026 BookEase, Inc.</p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  // ✅ default matches your User.model.js enum: "client" | "provider"
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // provider-only fields
  const [specialization, setSpecialization] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        phone,
        gender,
        password,
        role,
        ...(role === "provider" && { specialization, address }),
      };
      const { data } = await axios.post(`${API}/api/auth/register`, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(
        role === "provider" ? "/provider/dashboard" : "/client/dashboard",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <LeftPanel />

      <div className="flex flex-col justify-center bg-slate-50 px-8 py-12 sm:px-16">
        <div className="w-full max-w-md mx-auto">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-700 mb-8 inline-block"
          >
            ← Back to home
          </Link>

          <h1
            className="text-3xl font-bold text-slate-900 mb-1"
            style={{ fontFamily: "Poppins" }}
          >
            Create your account
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Get started with BookEase for free
          </p>

          {/* Role selector */}
          <p className="text-sm font-medium text-slate-700 mb-3">Continue as</p>
          <div className="flex gap-3 mb-8">
            <RoleCard
              role="client"
              label="Customer"
              sub="Book services"
              icon={User}
              selected={role === "client"}
              onClick={setRole}
            />
            <RoleCard
              role="provider"
              label="Provider"
              sub="Offer services"
              icon={Briefcase}
              selected={role === "provider"}
              onClick={setRole}
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* ── Shared fields ── */}
            <Field
              label="Full Name"
              id="name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Field
              label="Email address"
              id="email"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Field
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Field label="Gender" id="gender">
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                           text-slate-900 text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>

            {/* ── Provider-only fields ── */}
            {role === "provider" && (
              <>
                <Field
                  label="Specialization"
                  id="specialization"
                  placeholder="e.g. Dental Care, Fitness, Medical"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />

                <Field
                  label="Clinic / Business Address"
                  id="address"
                  placeholder="123 Main St, New York, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </>
            )}

            {/* ── Password ── */}
            <Field label="Password" id="password">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50
                             text-slate-900 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field label="Confirm Password" id="confirm">
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50
                             text-slate-900 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Field>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-base
                         hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
