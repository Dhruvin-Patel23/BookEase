import { useState, useEffect } from "react";
import { Pencil, X, Plus, Calendar } from "lucide-react";
import ProviderShell from "../../components/layout/ProviderShell";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DURATIONS = [15, 30, 45, 60, 90, 120];
const BUFFERS = ["None", "5 min", "10 min", "15 min", "30 min", "Custom"];
const BLOCK_TYPES = ["Vacation", "Holiday", "Leave", "Other"];

// ── Toggle ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full
                  transition-colors duration-200 focus:outline-none shrink-0
                  ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow-md
                    transform transition-transform duration-200
                    ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

// ── Day editor modal ──────────────────────────────────────────────────
function DayEditor({ day, schedule, onSave, onClose }) {
  const [start, setStart] = useState(schedule.start || "09:00");
  const [end, setEnd] = useState(schedule.end || "17:00");
  const [breaks, setBreaks] = useState(schedule.breaks || []);

  function addBreak() {
    setBreaks((b) => [...b, { start: "12:00", end: "13:00" }]);
  }
  function removeBreak(i) {
    setBreaks((b) => b.filter((_, idx) => idx !== i));
  }
  function updateBreak(i, field, val) {
    setBreaks((b) =>
      b.map((br, idx) => (idx === i ? { ...br, [field]: val } : br)),
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">{day} Hours</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Start
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <span className="text-slate-400 mt-5">—</span>
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              End
            </label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Breaks</span>
            <button
              onClick={addBreak}
              className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add break
            </button>
          </div>
          {breaks.length === 0 && (
            <p className="text-xs text-slate-400">No breaks added</p>
          )}
          {breaks.map((br, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="time"
                value={br.start}
                onChange={(e) => updateBreak(i, "start", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="time"
                value={br.end}
                onChange={(e) => updateBreak(i, "end", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => removeBreak(i)}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700
                       font-semibold text-sm hover:border-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ start, end, breaks })}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold
                       text-sm hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Blocked Period modal ──────────────────────────────────────────
function AddBlockModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("Vacation");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">Block Period</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Vacation"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700
                       font-semibold text-sm hover:border-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({ title, startDate, endDate: endDate || startDate, type })
            }
            disabled={!title || !startDate}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold
                       text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AvailabilityManager() {
  const token = localStorage.getItem("token");

  const [weeklySchedule, setWeeklySchedule] = useState(
    DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: {
          enabled: ["Monday", "Tuesday", "Thursday", "Friday"].includes(day),
          start: "09:00",
          end: day === "Friday" ? "16:00" : "17:00",
          breaks: [{ start: "12:00", end: "13:00" }],
        },
      }),
      {},
    ),
  );
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState("None");
  const [customBuffer, setCustomBuffer] = useState("");
  const [blockedPeriods, setBlockedPeriods] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [serviceDurations, setServiceDurations] = useState({});

  const [editingDay, setEditingDay] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [fetching, setFetching] = useState(true);

  // ── fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/provider/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.weeklySchedule && Object.keys(data.weeklySchedule).length > 0)
          setWeeklySchedule(data.weeklySchedule);
        if (data.defaultDuration) setDefaultDuration(data.defaultDuration);
        if (data.bufferTime) {
          // If the saved value isn't one of the preset options, it's a custom value
          if (BUFFERS.slice(0, -1).includes(data.bufferTime)) {
            setBufferTime(data.bufferTime);
          } else if (data.bufferTime !== "None") {
            setBufferTime("Custom");
            // Strip " min" suffix if present for the input field
            setCustomBuffer(data.bufferTime.replace(" min", ""));
          }
        }
        if (data.blockedPeriods) setBlockedPeriods(data.blockedPeriods);
        if (data.specializations) setSpecializations(data.specializations);
        if (data.serviceDurations) setServiceDurations(data.serviceDurations);
      } catch (err) {
        console.error("Load availability error:", err.message);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  // ── helpers ──────────────────────────────────────────────────────
  function toggleDay(day) {
    setWeeklySchedule((s) => ({
      ...s,
      [day]: { ...s[day], enabled: !s[day].enabled },
    }));
  }

  function saveDayEditor(day, values) {
    setWeeklySchedule((s) => ({ ...s, [day]: { ...s[day], ...values } }));
    setEditingDay(null);
  }

  function setServiceDuration(spec, duration) {
    setServiceDurations((prev) => ({ ...prev, [spec]: Number(duration) }));
  }

  // Resolve the actual buffer value to save
  function resolvedBufferTime() {
    if (bufferTime !== "Custom") return bufferTime;
    const val = parseInt(customBuffer, 10);
    if (!val || val <= 0) return "None";
    return `${val} min`;
  }

  // ── save ─────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${API}/api/provider/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weeklySchedule,
          defaultDuration,
          bufferTime: resolvedBufferTime(),
          blockedPeriods,
          serviceDurations,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMsg({ type: "success", text: "Availability saved successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (fetching) {
    return (
      <ProviderShell title="Availability">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProviderShell>
    );
  }

  return (
    <ProviderShell title="Availability">
      {editingDay && (
        <DayEditor
          day={editingDay}
          schedule={weeklySchedule[editingDay]}
          onSave={(values) => saveDayEditor(editingDay, values)}
          onClose={() => setEditingDay(null)}
        />
      )}
      {showAddBlock && (
        <AddBlockModal
          onSave={(block) => {
            setBlockedPeriods((b) => [...b, block]);
            setShowAddBlock(false);
          }}
          onClose={() => setShowAddBlock(false)}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        <h2
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: "Poppins" }}
        >
          Availability Manager
        </h2>

        {/* ── Weekly Schedule ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-1">Weekly Schedule</h3>
          <p className="text-sm text-slate-400 mb-5">
            Configure working hours and breaks per day. Click ✏️ to edit a day.
          </p>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const s = weeklySchedule[day];
              return (
                <div
                  key={day}
                  className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0"
                >
                  <Toggle checked={s.enabled} onChange={() => toggleDay(day)} />
                  <span className="w-24 text-sm font-medium text-slate-700">
                    {day}
                  </span>
                  {s.enabled ? (
                    <>
                      <span className="text-sm text-slate-700 font-mono">
                        {s.start}
                      </span>
                      <span className="text-slate-400 text-sm">—</span>
                      <span className="text-sm text-slate-700 font-mono">
                        {s.end}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {s.breaks?.length > 0
                          ? `${s.breaks.length} break`
                          : "No breaks"}
                      </span>
                      <button
                        onClick={() => setEditingDay(day)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 ml-2">
                      Unavailable
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Appointment Duration ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-1">
            Appointment Duration
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            Set the default session length for all bookings.
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDefaultDuration(d)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  defaultDuration === d
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>

          {specializations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700 mb-1">
                Per-Specialization Duration
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Override the default duration for specific specializations.
                Falls back to default if not set.
              </p>
              <div className="space-y-2">
                {specializations.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center justify-between px-4 py-3 rounded-xl
                               bg-slate-50 border border-slate-100"
                  >
                    <span className="text-sm text-slate-700 font-medium">
                      {spec}
                    </span>
                    <select
                      value={serviceDurations[spec] || defaultDuration}
                      onChange={(e) => setServiceDuration(spec, e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm
                                 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {DURATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} min
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {specializations.length === 0 && (
            <p className="text-xs text-slate-400 mt-4">
              Add specializations in your{" "}
              <a
                href="/provider/profile"
                className="text-blue-500 hover:underline"
              >
                Profile
              </a>{" "}
              to set per-specialization durations.
            </p>
          )}
        </div>

        {/* ── Buffer Time ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-1">Buffer Time</h3>
          <p className="text-sm text-slate-400 mb-5">
            A gap between appointments to give you time to prepare.
          </p>
          <div className="flex flex-wrap gap-2">
            {BUFFERS.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setBufferTime(b);
                  if (b !== "Custom") setCustomBuffer("");
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  bufferTime === b
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Custom buffer input — revealed when "Custom" is selected */}
          {bufferTime === "Custom" && (
            <div className="mt-4 flex items-center gap-3">
              <div className="relative w-36">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customBuffer}
                  onChange={(e) => setCustomBuffer(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full px-4 py-2.5 pr-14 rounded-xl border border-blue-300
                             bg-blue-50 text-slate-900 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-blue-400
                             placeholder-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                  min
                </span>
              </div>
              {customBuffer && parseInt(customBuffer, 10) > 0 && (
                <span className="text-sm text-slate-500">
                  = {parseInt(customBuffer, 10)} minute buffer
                </span>
              )}
            </div>
          )}

          {/* Active buffer summary */}
          <p className="text-xs text-slate-400 mt-3">
            Active:{" "}
            <span className="font-semibold text-slate-600">
              {bufferTime === "Custom"
                ? customBuffer && parseInt(customBuffer, 10) > 0
                  ? `${parseInt(customBuffer, 10)} min`
                  : "—"
                : bufferTime}
            </span>
          </p>
        </div>

        {/* ── Blocked Periods ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900">Blocked Periods</h3>
            <button
              onClick={() => setShowAddBlock(true)}
              className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              <Plus className="w-4 h-4" /> Add Period
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-5">
            Block vacation, holidays, or leave. Clients won't see slots on these
            dates.
          </p>
          {blockedPeriods.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No blocked periods added
            </p>
          ) : (
            <div className="space-y-2">
              {blockedPeriods.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl
                             bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {b.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {b.startDate}
                        {b.endDate !== b.startDate ? ` — ${b.endDate}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full
                                     bg-white border border-slate-200 text-slate-600"
                    >
                      {b.type}
                    </span>
                    <button
                      onClick={() =>
                        setBlockedPeriods((p) =>
                          p.filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Message ── */}
        {msg.text && (
          <p
            className={`text-sm px-4 py-3 rounded-xl border ${
              msg.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {msg.text}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>
      </div>
    </ProviderShell>
  );
}
