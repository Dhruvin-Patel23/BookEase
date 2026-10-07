import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  CalendarCheck,
  Star,
  Bell,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/provider/dashboard" },
  { label: "Availability", icon: Settings, path: "/provider/availability" },
  {
    label: "Appointments",
    icon: CalendarCheck,
    path: "/provider/appointments",
  },
  { label: "Reviews", icon: Star, path: "/provider/reviews" },
  {
    label: "Notifications",
    icon: Bell,
    path: "/provider/notifications",
    badge: true,
  },
  { label: "Profile", icon: User, path: "/provider/profile" },
];

export default function ProviderSidebar({ open, onClose }) {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await fetch(`${API}/api/provider/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setProfileImage(data.profileImage || "");

        setUser((prev) => ({
          ...prev,
          name: data.name || prev.name,
          profession: data.profession || prev.profession,
          profileImage: data.profileImage || "",
        }));
      } catch (error) {
        console.error("Sidebar profile error:", error);
      }
    }

    loadProfile();
  }, []);

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "P";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-56 bg-white border-r border-slate-100
          flex flex-col z-30 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>

          <span
            className="font-bold text-lg text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            BookEase
          </span>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <span className="text-xs font-semibold bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
            Service Provider
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, path, badge }) => {
            const active = location.pathname === path;

            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-colors relative
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />

                {label}

                {badge && unreadCount > 0 && (
                  <span
                    className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-white text-purple-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {/* Profile Image */}
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Profile image failed:", profileImage);
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-purple-700 font-bold text-sm">
                  {initials}
                </span>
              )}
            </div>

            {/* User details */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.name || "Provider"}
              </p>

              <p className="text-xs text-slate-400 truncate">
                {user.profession ||
                  user.specialization ||
                  user.serviceName ||
                  "Service Provider"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
