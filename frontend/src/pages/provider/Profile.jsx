import { useState, useEffect } from "react";

import { Lock, Bell, Mail, Phone, MapPin, Star, X } from "lucide-react";
import ProviderShell from "../../components/layout/ProviderShell";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Toggle switch ────────────────────────────────────────────────────
function Toggle({ checked, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={() => !loading && onChange(!checked)}
      disabled={loading}
      className={`relative inline-flex items-center w-11 h-6 rounded-full
                  transition-colors duration-200 focus:outline-none shrink-0
                  ${checked ? "bg-blue-600" : "bg-slate-200"}
                  ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow-md
                    transform transition-transform duration-200
                    ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ── Field ────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT = `w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
               text-slate-900 placeholder-slate-400 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent`;

export default function ProviderProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // ── profile state ──────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // ── password state ─────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── notification prefs ─────────────────────────────────────────────
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    smsReminders: false,
    pushNotifications: true,
  });
  // tracks which pref key is currently saving
  const [savingPref, setSavingPref] = useState(null);
  const [prefsMsg, setPrefsMsg] = useState({ type: "", text: "" });

  const [savingAvailability, setSavingAvailability] = useState(false);

  // ── ui state ───────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [fetching, setFetching] = useState(true);

  // ── fetch profile ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API}/api/provider/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setName(data.name || "");
        setPhone(data.phone || "");
        setServiceName(data.serviceName || data.specialization || "");
        setAddress(data.address || "");
        setBio(data.bio || "");
        setIsAvailable(data.isAvailable ?? true);
        setSpecializations(data.specializations || []);
        setRating(data.rating || 0);
        setReviewCount(data.reviewCount || 0);
        setEmail(data.contactEmail || data.email || user.email || "");
        if (data.notificationPrefs) setPrefs(data.notificationPrefs);
      } catch (err) {
        console.error("Fetch profile error:", err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, []);

  // ── save profile ───────────────────────────────────────────────────
  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setProfileLoading(true);
    try {
      const res = await fetch(`${API}/api/provider/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          serviceName,
          address,
          bio,
          isAvailable,
          specializations,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, name, serviceName, address }),
      );

      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  }

  // ── change password ────────────────────────────────────────────────
  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API}/api/provider/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPasswordMsg({
        type: "success",
        text: "Password updated successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  }

  // ── live availability toggle ───────────────────────────────────────
  async function handleToggleAvailability(value) {
    setIsAvailable(value);
    setSavingAvailability(true);
    try {
      const res = await fetch(`${API}/api/provider/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          serviceName,
          address,
          bio,
          isAvailable: value,
          specializations,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err) {
      setIsAvailable(!value);
      setProfileMsg({
        type: "error",
        text: `Availability update failed: ${err.message}`,
      });
    } finally {
      setSavingAvailability(false);
    }
  }

  // ── live toggle: update one pref key instantly ─────────────────────
  async function handleTogglePref(key, value) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated); // optimistic UI update
    setSavingPref(key);
    setPrefsMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API}/api/provider/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          serviceName,
          address,
          bio,
          isAvailable,
          specializations,
          notificationPrefs: updated,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // success — no banner needed, the toggle itself is the feedback
    } catch (err) {
      // revert optimistic update on failure
      setPrefs(prefs);
      setPrefsMsg({ type: "error", text: `Failed to update: ${err.message}` });
    } finally {
      setSavingPref(null);
    }
  }

  // ── tag helpers ────────────────────────────────────────────────────
  function addTag() {
    const tag = newTag.trim();
    if (tag && !specializations.includes(tag)) {
      setSpecializations((s) => [...s, tag]);
    }
    setNewTag("");
  }
  function removeTag(tag) {
    setSpecializations((s) => s.filter((t) => t !== tag));
  }

  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "P";

  if (fetching) {
    return (
      <ProviderShell title="Profile">
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                          rounded-full animate-spin"
          />
        </div>
      </ProviderShell>
    );
  }

  return (
    <ProviderShell title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: "Poppins" }}
        >
          Provider Profile
        </h2>

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full bg-purple-100 flex items-center
                              justify-center text-2xl font-bold text-purple-700"
              >
                {initials}
              </div>
              <div
                className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full
                              flex items-center justify-center cursor-pointer
                              hover:bg-blue-700 transition-colors"
              >
                <span className="text-white text-xs">✏️</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {name || "Your Name"}
              </h3>
              <p className="text-slate-500 text-sm">
                {serviceName || "Service Provider"}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {rating.toFixed(1)}
                    <span className="text-slate-400 font-normal">
                      ({reviewCount} reviews)
                    </span>
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${isAvailable ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {isAvailable ? "Active" : "Inactive"}
                </span>
                {address && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" /> {address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <Field label="Name">
              <input
                className={INPUT}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="James Torres"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  className={`${INPUT} opacity-60 cursor-not-allowed`}
                  value={email}
                  readOnly
                />
              </Field>
              <Field label="Phone">
                <input
                  className={INPUT}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Service Name">
                <input
                  className={INPUT}
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Personal Trainer"
                />
              </Field>
              <Field label="Location">
                <input
                  className={INPUT}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Midtown, NY"
                />
              </Field>
            </div>

            <div
              className="flex items-center justify-between py-3 px-4
                            bg-slate-50 rounded-xl border border-slate-100"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Availability
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Currently accepting bookings
                </p>
              </div>
              <div className="flex items-center gap-2">
                {savingAvailability && (
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
                <span className="text-xs text-slate-500">
                  {isAvailable ? "On" : "Off"}
                </span>
                <Toggle
                  checked={isAvailable}
                  loading={savingAvailability}
                  onChange={handleToggleAvailability}
                />
              </div>
            </div>

            <Field label="Bio">
              <textarea
                rows={4}
                className={INPUT}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients about yourself..."
              />
            </Field>

            <Field label="Specializations">
              <div
                className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200
                              bg-slate-50 min-h-12"
              >
                {specializations.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700
                               text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Add tag..."
                    className="text-xs border border-dashed border-slate-300 rounded-full
                               px-3 py-1.5 text-slate-600 focus:outline-none
                               focus:border-blue-400 bg-white w-24"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700 px-2"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </Field>

            {profileMsg.text && (
              <p
                className={`text-sm px-4 py-3 rounded-xl border ${
                  profileMsg.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {profileMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold
                         text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <h3
              className="font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              Change Password
            </h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Field label="Current Password">
              <input
                type="password"
                className={INPUT}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
            <Field label="New Password">
              <input
                type="password"
                className={INPUT}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
              />
            </Field>
            <Field label="Confirm New Password">
              <input
                type="password"
                className={INPUT}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </Field>
            <p className="text-xs text-slate-400">
              Password must be at least 8 characters and include uppercase,
              lowercase, and a number.
            </p>
            {passwordMsg.text && (
              <p
                className={`text-sm px-4 py-3 rounded-xl border ${
                  passwordMsg.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {passwordMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2
                         border-slate-200 text-slate-700 font-semibold text-sm
                         hover:border-slate-300 transition-colors disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* ── Notification Preferences ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-500" />
            </div>
            <h3
              className="font-bold text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-1">
            {[
              {
                key: "emailReminders",
                icon: Mail,
                label: "Email Reminders",
                sub: "Get appointment reminders via email",
              },
              {
                key: "smsReminders",
                icon: Phone,
                label: "SMS Reminders",
                sub: "Receive text message reminders",
              },
              {
                key: "pushNotifications",
                icon: Bell,
                label: "Push Notifications",
                sub: "In-app notification alerts",
              },
            ].map(({ key, icon: Icon, label, sub }) => (
              <div
                key={key}
                className="flex items-center justify-between py-3
                           border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {savingPref === key && (
                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  <Toggle
                    checked={prefs[key]}
                    loading={savingPref === key}
                    onChange={(val) => handleTogglePref(key, val)}
                  />
                </div>
              </div>
            ))}

            {prefsMsg.text && (
              <p
                className={`text-sm px-4 py-3 rounded-xl border mt-2 ${
                  prefsMsg.type === "error"
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                {prefsMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </ProviderShell>
  );
}
