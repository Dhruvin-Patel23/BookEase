import { useState } from "react";
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
} from "lucide-react";
import Shell from "../../components/layout/Shell";
import StatCard from "../../components/common/StatCard";
import Pill from "../../components/common/Pill";
import {
  MOCK_STATS,
  MOCK_NEXT_APPOINTMENT,
  MOCK_APPOINTMENTS,
  MOCK_NOTIFICATIONS,
  SERVICES,
  PROVIDERS,
} from "../../data/mockData";

// ── Greeting based on time ──────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Appointment row ─────────────────────────────────────────────────
function AptRow({ apt, onView, onReschedule, onCancel }) {
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0
                    animate-fadeIn"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <span className="text-blue-700 font-bold text-xs">{apt.initials}</span>
      </div>

      {/* Info */}
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

      {/* Price + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-semibold text-slate-900 text-sm">
          ${apt.price}
        </span>
        <button
          onClick={() => onView(apt)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onReschedule(apt)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onCancel(apt)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────
export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [service, setService] = useState(SERVICES[0]);
  const [provider, setProvider] = useState(PROVIDERS[0]);

  function handleView(apt) {
    navigate(`/client/appointments/${apt.id}`);
  }
  function handleReschedule(apt) {
    navigate(`/client/appointments/${apt.id}/reschedule`);
  }
  function handleCancel(apt) {
    alert(`Cancel: ${apt.service}`);
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
            You have {MOCK_STATS.upcoming} upcoming appointments this week.
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
              className="flex items-center gap-2 border border-white/40 text-white font-semibold
                         text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4" /> View Appointments
            </button>
            <button
              onClick={() => navigate("/client/notifications")}
              className="flex items-center gap-2 border border-white/40 text-white font-semibold
                         text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Booked"
            value={MOCK_STATS.totalBooked}
            iconBg="bg-blue-50"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            delta="+3 vs last month"
          />
          <StatCard
            label="Completed"
            value={MOCK_STATS.completed}
            iconBg="bg-green-50"
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          />
          <StatCard
            label="Upcoming"
            value={MOCK_STATS.upcoming}
            iconBg="bg-amber-50"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            label="Cancelled"
            value={MOCK_STATS.cancelled}
            iconBg="bg-red-50"
            icon={<XCircle className="w-5 h-5 text-red-500" />}
          />
        </div>

        {/* ── Bottom two columns ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left col — appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next appointment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3
                className="font-bold text-slate-900 mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Next Appointment
              </h3>
              <div className="flex items-start gap-4">
                {/* Date chip */}
                <div
                  className="w-14 h-14 rounded-2xl bg-blue-600 flex flex-col items-center
                                justify-center text-white shrink-0"
                >
                  <span className="text-xs font-semibold">
                    {MOCK_NEXT_APPOINTMENT.month}
                  </span>
                  <span className="text-xl font-bold leading-tight">
                    {MOCK_NEXT_APPOINTMENT.day}
                  </span>
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">
                      {MOCK_NEXT_APPOINTMENT.service}
                    </span>
                    <Pill status={MOCK_NEXT_APPOINTMENT.status} />
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {MOCK_NEXT_APPOINTMENT.provider}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />{" "}
                      {MOCK_NEXT_APPOINTMENT.time}
                    </span>
                    <span className="flex items-center gap-1">
                      💲 ${MOCK_NEXT_APPOINTMENT.price}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/client/appointments/${MOCK_NEXT_APPOINTMENT.id}`)
                  }
                  className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm
                             hover:text-blue-700 shrink-0"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
              </div>
            </div>

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
                  className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div>
                {MOCK_APPOINTMENTS.map((apt) => (
                  <AptRow
                    key={apt.id}
                    apt={apt}
                    onView={handleView}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            {/* Quick Book */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3
                className="font-bold text-slate-900 mb-4"
                style={{ fontFamily: "Poppins" }}
              >
                Quick Book
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Service
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white
                               text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white
                               text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/client/book?service=${service}&provider=${provider}`,
                    )
                  }
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm
                             hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Find Slots <ChevronRight className="w-4 h-4" />
                </button>
              </div>
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
                  className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  See all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center
                                    shrink-0 text-base ${n.iconBg}`}
                    >
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    {/* Pulsing unread dot */}
                    {n.unread && (
                      <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
