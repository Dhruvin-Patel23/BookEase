import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  LayoutDashboard,
  CalendarDays,
  Settings,
  CalendarCheck,
  Star,
  Bell,
  User,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/provider/dashboard" },
  { label: "Calendar", icon: CalendarDays, path: "/provider/calendar" },
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials =
    user.name
      ?.split(" ")
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

      {/* Sidebar — fixed, never moves */}
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, path, badge }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                            transition-colors relative
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {badge && (
                  <span className="ml-auto relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-purple-700 font-bold text-sm">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.specialization || user.serviceName || "Service Provider"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
