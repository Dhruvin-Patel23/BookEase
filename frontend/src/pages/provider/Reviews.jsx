import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, TrendingUp, Award } from "lucide-react";
import ProviderShell from "../../components/layout/ProviderShell";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""} ago`;
}

export default function ProviderReviews() {
  const token = localStorage.getItem("token");

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/provider/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <ProviderShell title="Reviews">
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Overall rating */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 opacity-80" />
                    <span className="text-sm font-semibold opacity-80">Overall Rating</span>
                  </div>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-bold" style={{ fontFamily: "Poppins" }}>
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-amber-200 text-lg mb-2">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${s <= Math.round(stats.averageRating) ? "fill-white text-white" : "text-amber-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-amber-100 text-sm">{stats.total} review{stats.total !== 1 ? "s" : ""}</p>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-slate-500" />
                    <span className="font-semibold text-slate-900" style={{ fontFamily: "Poppins" }}>Rating Breakdown</span>
                  </div>
                  <div className="space-y-2">
                    {(stats.breakdown || []).map(({ star, count }) => {
                      const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12 shrink-0">
                            <span className="text-sm text-slate-600">{star}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-6 shrink-0 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "Poppins" }}>
                  No reviews yet
                </h3>
                <p className="text-slate-400 text-sm">
                  Complete appointments to start receiving reviews from clients.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-fadeIn">
                    <div className="flex items-start gap-4">
                      {/* Client avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {review.client?.profileImage ? (
                          <img src={review.client.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-blue-700 font-bold text-sm">
                            {(review.client?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <div>
                            <span className="font-semibold text-slate-900">{review.client?.name || "Anonymous"}</span>
                            {review.service && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                                {review.service}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{timeAgo(review.createdAt)}</span>
                        </div>

                        <StarDisplay rating={review.rating} />

                        {review.comment && (
                          <p className="text-slate-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProviderShell>
  );
}
