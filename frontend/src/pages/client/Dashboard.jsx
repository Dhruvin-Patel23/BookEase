import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  RotateCcw,
  X,
  Plus,
  ChevronRight,
  Bell,
  Star,
  RefreshCw,
} from "lucide-react";
import Shell from "../../components/layout/Shell";
import StatCard from "../../components/common/StatCard";
import Pill from "../../components/common/Pill";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NOTIF_ICONS = {
  booking_created: { icon: Calendar, bg: "bg-blue-100", color: "text-blue-600" },
  booking_confirmed: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  booking_cancelled: { icon: XCircle, bg: "bg-red-100", color: "text-red-500" },
  booking_completed: { icon: CheckCircle2, bg: "bg-purple-100", color: "text-purple-600" },
  booking_rescheduled: { icon: RefreshCw, bg: "bg-amber-100", color: "text-amber-600" },
  review_received: { icon: Star, bg: "bg-amber-100", color: "text-amber-500" },
  system: { icon: Bell, bg: "bg-slate-100", color: "text-slate-500" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function AptRow({ apt, onView, onReschedule, onCancel }) {
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-slate-50
                    last:border-0 animate-fadeIn"
    >
      <div
        className="w-9 h-9 rounded-full bg-blue-100 flex items-center
                      justify-center shrink-0"
      >
        <span className="text-blue-700 font-bold text-xs">{apt.initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">
            {apt.service}
          </span>
          <Pill status={apt.status} />
        </div>
        <p className="text-slate-400 text-xs mt-0.5 truncate">
          {apt.provider} · {apt.date} · {apt.time}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onView(apt)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600
                     hover:bg-blue-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onReschedule(apt)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500
                     hover:bg-amber-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onCancel(apt)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500
                     hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState(null);
  const [upcomingApts, setUpcomingApts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/client/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setStats(data.stats);
        setUpcomingApts(data.upcomingAppointments);
        setNotifications(data.notifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  function handleView() {
    navigate("/client/appointments");
  }
  function handleReschedule(apt) {
    navigate(`/client/book?reschedule=${apt.id}&service=${encodeURIComponent(apt.service)}`);
  }
  async function handleCancel(apt) {
    if (!window.confirm(`Cancel your ${apt.service} appointment?`)) return;
    try {
      const res = await fetch(`${API}/api/client/appointments/${apt.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: "" }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      // Refresh dashboard
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <Shell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                          rounded-full animate-spin"
          />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Welcome banner ── */}
        <div
          className="rounded-2xl p-6 md:p-8 text-white"
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #4338ca 100%)",
          }}
        >
          <h2
            className="text-xl md:text-2xl font-bold mb-1"
            style={{ fontFamily: "Poppins", color: "white" }}
          >
            {getGreeting()}, {user.name?.split(" ")[0] || "there"}! 👋
          </h2>
          <p className="text-blue-100 text-sm mb-5">
            You have {stats?.upcoming || 0} upcoming appointments this week.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/client/book")}
              className="flex items-center gap-2 bg-white text-blue-700 font-semibold
                         text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Book Appointment
            </button>
            <button
              onClick={() => navigate("/client/appointments")}
              className="flex items-center gap-2 border border-white/40 text-white
                         font-semibold text-sm px-4 py-2 rounded-xl
                         hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4" /> View Appointments
            </button>
            <button
              onClick={() => navigate("/client/notifications")}
              className="flex items-center gap-2 border border-white/40 text-white
                         font-semibold text-sm px-4 py-2 rounded-xl
                         hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Booked"
            value={stats?.totalBooked || 0}
            iconBg="bg-blue-50"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            label="Completed"
            value={stats?.completed || 0}
            iconBg="bg-green-50"
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          />
          <StatCard
            label="Upcoming"
            value={stats?.upcoming || 0}
            iconBg="bg-amber-50"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            label="Cancelled"
            value={stats?.cancelled || 0}
            iconBg="bg-red-50"
            icon={<XCircle className="w-5 h-5 text-red-500" />}
          />
        </div>

        {/* ── Bottom two columns ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming appointments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-slate-900"
                style={{ fontFamily: "Poppins" }}
              >
                Upcoming Appointments
              </h3>
              <button
                onClick={() => navigate("/client/appointments")}
                className="flex items-center gap-1 text-blue-600 text-sm
                           font-semibold hover:text-blue-700"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {upcomingApts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">No upcoming appointments</p>
                <p className="text-slate-400 text-sm mt-1">Book your first appointment to get started.</p>
                <button
                  onClick={() => navigate("/client/book")}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white
                             font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            ) : (
              upcomingApts.map((apt) => (
                <AptRow
                  key={apt.id}
                  apt={apt}
                  onView={handleView}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                />
              ))
            )}
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-slate-900"
                style={{ fontFamily: "Poppins" }}
              >
                Recent Notifications
              </h3>
              <button
                onClick={() => navigate("/client/notifications")}
                className="flex items-center gap-1 text-blue-600 text-sm
                           font-semibold hover:text-blue-700"
              >
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {notifications.map((n) => {
                  const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.system;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={n.id || n._id}
                      onClick={() => navigate("/client/notifications")}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}
                      >
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-slate-900 ${n.unread ? "font-bold" : "font-semibold"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">
                          {n.message}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
