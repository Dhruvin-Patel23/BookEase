import { useState, useEffect, useRef } from "react";
import { Lock, Bell, Mail, Phone, Camera } from "lucide-react";
import Shell from "../../components/layout/Shell";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ── Toggle ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full
                  transition-colors duration-200 focus:outline-none shrink-0
                  ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow-md
                        transform transition-transform duration-200
                        ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────
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

export default function ClientProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // ── profile state ─────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(user.profileImage || "");

  // ── password state ────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── notification prefs ────────────────────────────────────────────
  const [prefs, setPrefs] = useState({
    emailReminders: true,
    smsReminders: false,
    pushNotifications: true,
  });

  // ── ui state ──────────────────────────────────────────────────────
  const [fetching, setFetching] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [prefsMsg, setPrefsMsg] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);

  // ── fetch profile ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API}/api/client/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        if (data.notificationPrefs) setPrefs(data.notificationPrefs);
        if (data.profileImage) {
          setProfileImage(data.profileImage);
          // keep localStorage in sync
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          if (stored.profileImage !== data.profileImage) {
            localStorage.setItem(
              "user",
              JSON.stringify({ ...stored, profileImage: data.profileImage }),
            );
          }
        }
      } catch (err) {
        console.error("Fetch profile error:", err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, []);

  // ── upload image to Cloudinary then save URL to backend ───────────
  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset so same file can be picked again
    e.target.value = "";

    setImageUploading(true);
    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok)
        throw new Error(cloudData.error?.message || "Cloudinary upload failed");

      const imageUrl = cloudData.secure_url;

      // 2. Persist URL to your backend
      const res = await fetch(`${API}/api/client/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address,
          profileImage: imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 3. Update state + localStorage + notify Shell/Sidebar
      setProfileImage(imageUrl);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, profileImage: imageUrl }),
      );
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      console.error("Image upload error:", err.message);
    } finally {
      setImageUploading(false);
    }
  }

  // ── save profile ──────────────────────────────────────────────────
  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setProfileLoading(true);
    try {
      const res = await fetch(`${API}/api/client/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, name: `${firstName} ${lastName}`.trim() }),
      );
      window.dispatchEvent(new Event("userUpdated"));

      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  }

  // ── change password ───────────────────────────────────────────────
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
      const res = await fetch(`${API}/api/client/change-password`, {
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

  // ── save notification prefs ───────────────────────────────────────
  async function handleSavePrefs(e) {
    e.preventDefault();
    setPrefsLoading(true);
    try {
      const res = await fetch(`${API}/api/client/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address,
          notificationPrefs: prefs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPrefsMsg({ type: "success", text: "Preferences saved!" });
    } catch (err) {
      setPrefsMsg({ type: "error", text: err.message });
    } finally {
      setPrefsLoading(false);
    }
  }

  const initials =
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "C";

  if (fetching) {
    return (
      <Shell title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: "Poppins" }}
        >
          My Profile
        </h2>

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-8">
            {/* Clickable avatar */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-100
                            flex items-center justify-center cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-700">
                    {initials}
                  </span>
                )}

                {/* Hover dim + camera icon */}
                <div
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center justify-center"
                >
                  {imageUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>

              {/* Pencil badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full
                           bg-blue-600 border-2 border-white flex items-center
                           justify-center shadow-md hover:bg-blue-700 transition-colors
                           disabled:opacity-60"
              >
                {imageUploading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z"
                    />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {firstName} {lastName}
              </h3>
              <p className="text-slate-400 text-sm">Customer</p>
              <p
                className="text-xs text-blue-500 mt-0.5 cursor-pointer hover:underline"
                onClick={() => !imageUploading && fileInputRef.current?.click()}
              >
                {imageUploading ? "Uploading…" : "Change photo"}
              </p>
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <input
                  className={INPUT}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  required
                />
              </Field>
              <Field label="Last Name">
                <input
                  className={INPUT}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Johnson"
                  required
                />
              </Field>
            </div>

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

          <form onSubmit={handleSavePrefs} className="space-y-1">
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
                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
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
                <Toggle
                  checked={prefs[key]}
                  onChange={(val) => setPrefs((p) => ({ ...p, [key]: val }))}
                />
              </div>
            ))}

            {prefsMsg.text && (
              <p
                className={`text-sm px-4 py-3 rounded-xl border mt-2 ${
                  prefsMsg.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {prefsMsg.text}
              </p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={prefsLoading}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold
                           text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {prefsLoading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
}
