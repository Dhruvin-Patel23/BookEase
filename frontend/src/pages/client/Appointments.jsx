import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Filter,
  X,
  Star,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Phone,
  MapPin,
} from "lucide-react";
import Shell from "../../components/layout/Shell";
import Pill from "../../components/common/Pill";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          disabled={readonly}
        >
          <Star
            className={`w-6 h-6 ${
              s <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function CancelModal({ apt, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "Poppins" }}>
            Cancel Appointment
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 text-sm mb-4">
          Are you sure you want to cancel your{" "}
          <span className="font-semibold text-slate-900">{apt.service}</span> appointment on{" "}
          <span className="font-semibold text-slate-900">{apt.dateFormatted}</span> at{" "}
          <span className="font-semibold text-slate-900">{apt.timeSlot}</span>?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30
                     focus:border-red-400 resize-none mb-5"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Keep Appointment
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ apt, onClose, onSubmit, loading }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!rating) { setError("Please select a rating."); return; }
    onSubmit({ appointmentId: apt.id, rating, comment });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "Poppins" }}>
            Leave a Review
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-5 p-4 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
            {apt.provider?.profileImage ? (
              <img src={apt.provider.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-purple-700 font-bold text-sm">
                {(apt.provider?.name || "P").split(" ").map((n) => n[0]).join("").toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{apt.provider?.name}</p>
            <p className="text-slate-400 text-xs">{apt.service}</p>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-700 mb-2">Your rating</p>
        <StarRating value={rating} onChange={setRating} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700
                     placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30
                     focus:border-blue-400 resize-none mt-4 mb-5"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AptCard({ apt, onCancel, onReview, onReschedule }) {
  const [expanded, setExpanded] = useState(false);

  const canCancel = ["pending", "confirmed"].includes(apt.status);
  const canReview = apt.status === "completed" && !apt.review;
  const canReschedule = ["pending"].includes(apt.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        {/* Date badge */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex flex-col items-center justify-center text-white shrink-0">
          <span className="text-xs font-medium opacity-80">
            {new Date(apt.date).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-bold leading-none">
            {new Date(apt.date).getDate()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-slate-900">{apt.service}</span>
            <Pill status={apt.status} />
          </div>
          <p className="text-slate-500 text-sm truncate">
            {apt.provider?.name} · {apt.timeSlot}
            {apt.duration ? ` · ${apt.duration} min` : ""}
          </p>
          {apt.provider?.address && (
            <p className="text-slate-400 text-xs mt-0.5 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" /> {apt.provider.address}
            </p>
          )}
        </div>

        <ChevronRight
          className={`w-5 h-5 text-slate-300 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {/* Provider info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
              {apt.provider?.profileImage ? (
                <img src={apt.provider.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-purple-700 font-bold text-sm">
                  {(apt.provider?.name || "P").split(" ").map((n) => n[0]).join("").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{apt.provider?.name}</p>
              <p className="text-slate-400 text-xs">{apt.provider?.profession}</p>
            </div>
            {apt.provider?.phone && (
              <a
                href={`tel:${apt.provider.phone}`}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Details grid */}
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
                <p className="text-sm font-semibold text-slate-900">{apt.duration} minutes</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Status</p>
              <Pill status={apt.status} />
            </div>
          </div>

          {apt.notes && (
            <div className="mb-4 p-3 bg-amber-50 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
              <p className="text-sm text-amber-800">{apt.notes}</p>
            </div>
          )}

          {/* Existing review */}
          {apt.review && (
            <div className="mb-4 p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <StarRating value={apt.review.rating} readonly />
                <span className="text-xs text-green-700 font-semibold">Your review</span>
              </div>
              {apt.review.comment && (
                <p className="text-sm text-green-800">{apt.review.comment}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {canReview && (
              <button
                onClick={() => onReview(apt)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors"
              >
                <Star className="w-4 h-4" /> Leave Review
              </button>
            )}
            {canReschedule && (
              <button
                onClick={() => onReschedule(apt)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reschedule
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(apt)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientAppointments() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cancelModal, setCancelModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/client/appointments?${params}`, {
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
  }, [token, statusFilter, search]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function handleCancel(reason) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/client/appointments/${cancelModal.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCancelModal(null);
      setSuccessMsg("Appointment cancelled successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReviewSubmit({ appointmentId, rating, comment }) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/client/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointmentId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReviewModal(null);
      setSuccessMsg("Review submitted! Thank you for your feedback.");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function handleReschedule(apt) {
    navigate(`/client/book?reschedule=${apt.id}&providerId=${apt.provider?.id}&service=${encodeURIComponent(apt.service)}`);
  }

  const stats = {
    upcoming: appointments.filter((a) => ["pending", "confirmed"].includes(a.status) && new Date(a.date) >= new Date()).length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    total: appointments.length,
  };

  return (
    <Shell title="My Appointments">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success toast */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Upcoming", value: stats.upcoming, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Completed", value: stats.completed, color: "text-green-600", bg: "bg-green-50" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-500", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="apt-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service or provider…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700
                         placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 self-center shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === f.key
                    ? "bg-blue-600 text-white"
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
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "Poppins" }}>
              No appointments found
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              {statusFilter === "all" ? "You haven't booked any appointments yet." : `No ${statusFilter} appointments.`}
            </p>
            <button
              onClick={() => navigate("/client/book")}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <AptCard
                key={apt.id}
                apt={apt}
                onCancel={() => setCancelModal(apt)}
                onReview={() => setReviewModal(apt)}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        )}
      </div>

      {cancelModal && (
        <CancelModal
          apt={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={handleCancel}
          loading={actionLoading}
        />
      )}
      {reviewModal && (
        <ReviewModal
          apt={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
          loading={actionLoading}
        />
      )}
    </Shell>
  );
}
