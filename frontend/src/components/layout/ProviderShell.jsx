import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";
import ProviderSidebar from "./ProviderSidebar";

export default function ProviderShell({ children, title }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar — fixed, never moves */}
      <ProviderSidebar open={open} onClose={() => setOpen(false)} />

      {/* Main — pushed right by sidebar width */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Header — sticky */}
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
            <button className="relative p-2 rounded-xl hover:bg-slate-50">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full
                                 rounded-full bg-blue-400 opacity-75"
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
              </span>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50
                         hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
