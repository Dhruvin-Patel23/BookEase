import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const NotificationContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pollIntervalRef = useRef(null);

  const getAuthInfo = useCallback(() => {
    const token = localStorage.getItem("token");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return { token, role: user.role || null };
    } catch {
      return { token, role: null };
    }
  }, []);

  const getEndpoint = useCallback(() => {
    const { token, role } = getAuthInfo();
    if (!token || !role) return null;
    return role === "provider" ? `${API}/api/provider/notifications` : `${API}/api/client/notifications`;
  }, [getAuthInfo]);

  const fetchNotifications = useCallback(async () => {
    const { token } = getAuthInfo();
    const endpoint = getEndpoint();
    if (!token || !endpoint) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthInfo, getEndpoint]);

  const fetchUnreadCount = useCallback(async () => {
    const { token } = getAuthInfo();
    const endpoint = getEndpoint();
    if (!token || !endpoint) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch {
      // ignore network errors on background poll
    }
  }, [getAuthInfo, getEndpoint]);

  const markAsRead = useCallback(async (id) => {
    const { token } = getAuthInfo();
    const endpoint = getEndpoint();
    if (!token || !endpoint) return;

    try {
      // optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      await fetch(`${endpoint}/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // revert on failure by refetching
      fetchUnreadCount();
    }
  }, [getAuthInfo, getEndpoint, fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    const { token } = getAuthInfo();
    const endpoint = getEndpoint();
    if (!token || !endpoint) return;

    try {
      // optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      await fetch(`${endpoint}/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchUnreadCount();
    }
  }, [getAuthInfo, getEndpoint, fetchUnreadCount]);

  const deleteNotification = useCallback(async (id) => {
    const { token } = getAuthInfo();
    const endpoint = getEndpoint();
    if (!token || !endpoint) return;

    try {
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  }, [getAuthInfo, getEndpoint, notifications, fetchNotifications]);

  const clearAllNotifications = useCallback(async () => {
    const { token } = getAuthInfo();
    const endpoint = getEndpoint();
    if (!token || !endpoint) return;

    try {
      setNotifications([]);
      setUnreadCount(0);

      await fetch(`${endpoint}/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  }, [getAuthInfo, getEndpoint, fetchNotifications]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchUnreadCount();

    const handleFocus = () => {
      fetchUnreadCount();
    };

    const handleCustomUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("notifications-updated", handleCustomUpdate);

    // Poll every 25 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 25000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("notifications-updated", handleCustomUpdate);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
