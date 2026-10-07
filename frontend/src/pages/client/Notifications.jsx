import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  Check,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Shell from "../../components/layout/Shell";
import { useNotifications } from "../../context/NotificationContext";

const TYPE_ICONS = {
  booking_created: { icon: Calendar, bg: "bg-blue-100", color: "text-blue-600" },
  booking_confirmed: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  booking_cancelled: { icon: XCircle, bg: "bg-red-100", color: "text-red-500" },
  booking_completed: { icon: CheckCircle2, bg: "bg-purple-100", color: "text-purple-600" },
  booking_rescheduled: { icon: RefreshCw, bg: "bg-amber-100", color: "text-amber-600" },
  review_received: { icon: Star, bg: "bg-amber-100", color: "text-amber-500" },
  system: { icon: Bell, bg: "bg-slate-100", color: "text-slate-500" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ClientNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  function handleClick(notif) {
    if (!notif.read) markAsRead(notif._id);
    if (notif.appointment) {
      navigate("/client/appointments");
    }
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    deleteNotification(id);
  }

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <Shell title="Notifications">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="font-bold text-slate-900 text-lg" style={{ fontFamily: "Poppins" }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Clear all notifications?")) {
                    clearAllNotifications();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <BellOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "Poppins" }}>
              {filter === "unread" ? "No unread notifications!" : "All caught up!"}
            </h3>
            <p className="text-slate-400 text-sm">
              {filter === "unread" ? "You have read all your notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filteredNotifications.map((notif) => {
              const cfg = TYPE_ICONS[notif.type] || TYPE_ICONS.system;
              const Icon = cfg.icon;
              return (
                <div
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`group w-full flex items-start gap-4 px-5 py-4 text-left transition-colors cursor-pointer hover:bg-slate-50
                    ${!notif.read ? "bg-blue-50/40" : ""}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-slate-900 ${!notif.read ? "font-bold" : "font-semibold"}`}>
                      {notif.title}
                    </p>
                    <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Actions & unread dot */}
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    {!notif.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" title="Unread" />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notif._id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
