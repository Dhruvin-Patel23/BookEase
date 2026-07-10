import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import ProviderShell from "../../components/layout/ProviderShell";
import StatCard from "../../components/common/StatCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Avatar({ initials, bg = "bg-purple-100", text = "text-purple-700" }) {
  return (
    <div
      className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}
    >
      <span className={`font-bold text-sm ${text}`}>{initials}</span>
    </div>
  );
}

function PendingCard({ req, onAccept, onReject, onView }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar initials={req.initials} />
          <div>
            <p className="font-semibold text-slate-900 text-sm">{req.name}</p>
            <p className="text-slate-400 text-xs">{req.service}</p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
          Pending
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Date</p>
          <p className="text-sm font-medium text-slate-900">{req.date}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Time</p>
          <p className="text-sm font-medium text-slate-900">{req.time}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Duration</p>
          <p className="text-sm font-medium text-slate-900">{req.duration}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onAccept(req)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                     bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
        >
          <Check className="w-4 h-4" /> Accept
        </button>
        <button
          onClick={() => onReject(req)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                     bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" /> Reject
        </button>
        <button
          onClick={() => onView(req)}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-400
                     hover:text-blue-600 hover:border-blue-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ConfirmedRow({ apt }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <Avatar initials={apt.initials} bg="bg-blue-100" text="text-blue-700" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {apt.name}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {apt.service} · {apt.time}
        </p>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [confirmedToday, setConfirmedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/provider/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setStats(data.stats);
        setPendingList(data.pendingRequests);
        setConfirmedToday(data.confirmedToday);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  async function handleAccept(req) {
    try {
      const res = await fetch(`${API}/api/provider/appointments/${req.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "confirmed" }),
      });
      if (!res.ok) throw new Error("Failed to accept.");
      // remove from pending list
      setPendingList((p) => p.filter((x) => x.id !== req.id));
      // update stats
      setStats((s) => ({
        ...s,
        pendingRequests: s.pendingRequests - 1,
        todayAppointments: s.todayAppointments + 1,
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReject(req) {
    try {
      const res = await fetch(`${API}/api/provider/appointments/${req.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to reject.");
      setPendingList((p) => p.filter((x) => x.id !== req.id));
      setStats((s) => ({
        ...s,
        pendingRequests: s.pendingRequests - 1,
        cancelled: s.cancelled + 1,
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  function handleView(req) {
    navigate(`/provider/appointments/${req.id}`);
  }

  if (loading) {
    return (
      <ProviderShell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                          rounded-full animate-spin"
          />
        </div>
      </ProviderShell>
    );
  }

  if (error) {
    return (
      <ProviderShell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </ProviderShell>
    );
  }

  return (
    <ProviderShell title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome banner */}
        <div
          className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full bg-white/20 flex items-center
                            justify-center shrink-0 text-xl font-bold text-white"
            >
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "P"}
            </div>
            <div className="flex-1">
              <h2
                className="text-xl md:text-2xl font-bold mb-0.5"
                style={{ fontFamily: "Poppins", color: "white" }}
              >
                {getGreeting()}, {user.name?.split(" ")[0] || "there"}! 👋
              </h2>
              <p className="text-purple-200 text-sm mb-5">
                {user.serviceName || "Service Provider"}
                {user.specialization ? ` · ${user.specialization}` : ""}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/provider/appointments")}
                  className="flex items-center gap-2 bg-white/15 border border-white/30
                             text-white font-semibold text-sm px-4 py-2 rounded-xl
                             hover:bg-white/25 transition-colors"
                >
                  <Calendar className="w-4 h-4" /> View Appointments
                </button>
                <button
                  onClick={() => navigate("/provider/calendar")}
                  className="flex items-center gap-2 bg-white/15 border border-white/30
                             text-white font-semibold text-sm px-4 py-2 rounded-xl
                             hover:bg-white/25 transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Open Calendar
                </button>
                <button
                  onClick={() => navigate("/provider/notifications")}
                  className="flex items-center gap-2 bg-white/15 border border-white/30
                             text-white font-semibold text-sm px-4 py-2 rounded-xl
                             hover:bg-white/25 transition-colors"
                >
                  🔔 {stats?.pendingRequests || 0} new
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Today's Appointments"
            value={stats?.todayAppointments || 0}
            iconBg="bg-blue-50"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            label="Pending Requests"
            value={stats?.pendingRequests || 0}
            iconBg="bg-amber-50"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            label="Completed"
            value={stats?.completed || 0}
            iconBg="bg-green-50"
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          />
          <StatCard
            label="Cancelled"
            value={stats?.cancelled || 0}
            iconBg="bg-red-50"
            icon={<XCircle className="w-5 h-5 text-red-500" />}
          />
          <StatCard
            label="Average Rating"
            value={stats?.averageRating || 0}
            iconBg="bg-amber-50"
            icon={<Star className="w-5 h-5 text-amber-400" />}
          />
        </div>

        {/* Bottom two columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending requests */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-slate-900 text-lg"
                style={{ fontFamily: "Poppins" }}
              >
                Pending Requests
              </h3>
              {pendingList.length > 0 && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {pendingList.length} waiting
                </span>
              )}
            </div>

            {pendingList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-semibold text-slate-900">All caught up!</p>
                <p className="text-slate-400 text-sm mt-1">
                  No pending requests right now.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pendingList.map((req) => (
                  <PendingCard
                    key={req.id}
                    req={req}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirmed today */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-bold text-slate-900 text-lg"
                style={{ fontFamily: "Poppins" }}
              >
                Confirmed Today
              </h3>
              <button
                onClick={() => navigate("/provider/appointments")}
                className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-700"
              >
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              {confirmedToday.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">
                  No confirmed appointments today.
                </p>
              ) : (
                confirmedToday.map((apt) => (
                  <ConfirmedRow key={apt.id} apt={apt} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProviderShell>
  );
}
