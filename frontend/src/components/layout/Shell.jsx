import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useNotifications } from "../../context/NotificationContext";

export default function Shell({ children, title }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar — always fixed, never moves */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Main — pushed right by sidebar width on desktop */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Header — sticks to top of the right panel only */}
        <header
          className="h-16 bg-white border-b border-slate-100 sticky top-0 z-10
                           flex items-center justify-between px-4 md:px-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1
              className="font-bold text-lg md:text-xl text-slate-900"
              style={{ fontFamily: "Poppins" }}
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/client/notifications")}
              className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors"
              title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "Notifications"}
            >
              <Bell className="w-5 h-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content scrolls independently */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
