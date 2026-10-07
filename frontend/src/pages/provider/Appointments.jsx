import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Check,
  X,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import ProviderShell from "../../components/layout/ProviderShell";
import Pill from "../../components/common/Pill";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function AptCard({ apt, onAccept, onReject, onComplete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        {/* Date badge */}
        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex flex-col items-center justify-center text-white shrink-0">
          <span className="text-xs font-medium opacity-80">
            {new Date(apt.date).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-bold leading-none">{new Date(apt.date).getDate()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-slate-900">{apt.service}</span>
            <Pill status={apt.status} />
          </div>
          <p className="text-slate-500 text-sm truncate">
            {apt.client.name} · {apt.timeSlot}
            {apt.duration ? ` · ${apt.duration} min` : ""}
          </p>
        </div>

        <ChevronRight
          className={`w-5 h-5 text-slate-300 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {/* Client card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 font-bold text-sm">{apt.client.initials}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{apt.client.name}</p>
              {apt.client.email && (
                <p className="text-slate-400 text-xs">{apt.client.email}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Date</p>
              <p className="text-sm font-semibold text-slate-900">{apt.dateFormatted}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Time</p>
              <p className="text-sm font-semibold text-slate-900">{apt.timeSlot}</p>
            </div>
            {apt.duration && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Duration</p>
                <p className="text-sm font-semibold text-slate-900">{apt.duration} min</p>
              </div>
            )}
          </div>

          {apt.notes && (
            <div className="mb-4 p-3 bg-amber-50 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 mb-1">Client Notes</p>
              <p className="text-sm text-amber-800">{apt.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {apt.status === "pending" && (
              <>
                <button
                  onClick={() => onAccept(apt)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
                >
                  <Check className="w-4 h-4" /> Accept
                </button>
                <button
                  onClick={() => onReject(apt)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {apt.status === "confirmed" && (
              <button
                onClick={() => onComplete(apt)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProviderAppointments() {
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`${API}/api/provider/appointments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function updateStatus(apt, status) {
    try {
      const res = await fetch(`${API}/api/provider/appointments/${apt.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg(`Appointment ${status} successfully.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = search
    ? appointments.filter(
        (a) =>
          a.service?.toLowerCase().includes(search.toLowerCase()) ||
          a.client?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : appointments;

  const stats = {
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <ProviderShell title="Appointments">
      <div className="max-w-4xl mx-auto space-y-6">
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Confirmed", value: stats.confirmed, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Completed", value: stats.completed, color: "text-green-600", bg: "bg-green-50" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-500", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="prov-apt-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service or client name…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 self-center shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === f.key
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "Poppins" }}>
              No appointments found
            </h3>
            <p className="text-slate-400 text-sm">
              {statusFilter === "all" ? "No appointments yet." : `No ${statusFilter} appointments.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((apt) => (
              <AptCard
                key={apt.id}
                apt={apt}
                onAccept={(a) => updateStatus(a, "confirmed")}
                onReject={(a) => updateStatus(a, "cancelled")}
                onComplete={(a) => updateStatus(a, "completed")}
              />
            ))}
          </div>
        )}
      </div>
    </ProviderShell>
  );
}
