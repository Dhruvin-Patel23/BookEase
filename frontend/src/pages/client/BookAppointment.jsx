import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import Shell from "../../components/layout/Shell";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SERVICES = [
  { name: "Hair & Beauty", icon: "✂️" },
  { name: "Dental Care", icon: "🦷" },
  { name: "Medical", icon: "🏥" },
  { name: "Fitness", icon: "💪" },
  { name: "Massage", icon: "💆" },
  { name: "Nutrition", icon: "🥗" },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ── Step indicator ────────────────────────────────────────────────────
function Stepper({ step }) {
  const steps = ["Select Service", "Choose Provider", "Pick Time", "Confirm"];
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
      {steps.map((s, i) => {
        const num = i + 1;
        const done = step > num;
        const current = step === num;
        return (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${done ? "bg-green-500 text-white" : ""}
              ${current ? "bg-blue-600 text-white" : ""}
              ${!done && !current ? "bg-slate-100 text-slate-400" : ""}`}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : num}
            </div>
            <span
              className={`text-sm font-medium
              ${current ? "text-blue-600" : done ? "text-green-600" : "text-slate-400"}`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px ${step > num ? "bg-green-400" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Select Service ───────────────────────────────────────────
function SelectService({ onSelect }) {
  return (
    <div>
      <h2
        className="text-xl font-bold text-slate-900 mb-6"
        style={{ fontFamily: "Poppins" }}
      >
        What service do you need?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SERVICES.map((s) => (
          <button
            key={s.name}
            onClick={() => onSelect(s.name)}
            className="p-6 rounded-2xl border-2 border-slate-100 text-center
                       hover:border-blue-400 hover:shadow-md transition-all bg-white"
          >
            <span className="text-4xl mb-3 block">{s.icon}</span>
            <p className="font-bold text-slate-900 text-sm">{s.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2 — Choose Provider ──────────────────────────────────────────
function ChooseProvider({ service, onSelect, onBack }) {
  const token = localStorage.getItem("token");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [fallbackMsg, setFallbackMsg] = useState("");

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(
          `${API}/api/booking/providers?specialization=${encodeURIComponent(service)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setProviders(data.providers || []);
        if (data.fallback) {
          setFallbackMsg(
            `No providers found specifically for "${service}". Showing all available providers.`,
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, [service]);

  function getAvailableDays(provider) {
    const schedule = provider.availability?.weeklySchedule;
    if (!schedule) return [];
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days.filter((day) => {
      const d = schedule[day] || (schedule.get && schedule.get(day));
      return d?.enabled;
    });
  }

  const DAY_SHORT = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  return (
    <div>
      <h2
        className="text-xl font-bold text-slate-900 mb-6"
        style={{ fontFamily: "Poppins" }}
      >
        Choose a provider
      </h2>

      {/* Fallback message */}
      {fallbackMsg && (
        <p
          className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-100
                      rounded-xl px-4 py-3 mb-4"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" /> {fallbackMsg}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent
                          rounded-full animate-spin"
          />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">🔍</p>
          <p className="font-semibold text-slate-900">No providers found</p>
          <p className="text-slate-400 text-sm mt-1">
            No providers available for {service} right now.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {providers.map((p) => {
            const initials = (p.name || "P")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            const isExpanded = expandedId === p._id;
            const availDays = getAvailableDays(p);

            return (
              <div
                key={p._id}
                className={`bg-white rounded-2xl border transition-all shadow-sm
                  ${isExpanded ? "border-blue-300 shadow-md" : "border-slate-100"}`}
              >
                {/* Provider row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p._id)}
                  className="w-full p-5 flex items-center gap-4 text-left"
                >
                  {/* Avatar — shows image if available */}
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden bg-purple-100 flex items-center
                                  justify-center shrink-0 text-xl font-bold text-purple-700"
                  >
                    {p.profileImage ? (
                      <img
                        src={p.profileImage}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {p.isAvailable ? "Available" : "Busy"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5 truncate">
                      {p.specializations?.slice(0, 2).join(", ") ||
                        p.profession ||
                        "Service Provider"}
                      {p.address ? ` · 📍 ${p.address}` : ""}
                    </p>
                    {p.rating > 0 && (
                      <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {p.rating.toFixed(1)}
                        <span className="text-slate-400 font-normal">
                          ({p.reviewCount})
                        </span>
                      </span>
                    )}
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 text-slate-300 shrink-0 transition-transform
                                            ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    {/* Bio */}
                    {p.bio && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                          About
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {p.bio}
                        </p>
                      </div>
                    )}

                    {/* Specializations */}
                    {p.specializations?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Specializations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {p.specializations.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-semibold bg-blue-50 text-blue-700
                                         px-3 py-1.5 rounded-full border border-blue-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available days */}
                    {availDays.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Available Days
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => {
                            const isOn = availDays.includes(day);
                            return (
                              <span
                                key={day}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full
                                  ${
                                    isOn
                                      ? "bg-green-50 text-green-700 border border-green-100"
                                      : "bg-slate-50 text-slate-300 border border-slate-100"
                                  }`}
                              >
                                {DAY_SHORT[day]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    {p.rating > 0 && (
                      <div
                        className="flex items-center gap-3 mb-5 bg-amber-50
                                      rounded-xl px-4 py-3 border border-amber-100"
                      >
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {p.rating.toFixed(1)} out of 5
                          </p>
                          <p className="text-slate-400 text-xs">
                            Based on {p.reviewCount} reviews
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Book button */}
                    <button
                      onClick={() => onSelect(p)}
                      className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold
                                 text-sm hover:bg-blue-700 transition-colors flex items-center
                                 justify-center gap-2"
                    >
                      Book with {p.name?.split(" ")[0]}{" "}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
    </div>
  );
}

// ── Step 3 — Pick Date & Time ─────────────────────────────────────────
function PickTime({ provider, service, onSelect, onBack }) {
  const token = localStorage.getItem("token");

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSlots = async (date) => {
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    setMessage("");
    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const res = await fetch(
        `${API}/api/booking/slots?providerId=${provider._id}&date=${dateStr}&specialization=${encodeURIComponent(service)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setSlots(data.slots || []);
      setMessage(data.message || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  return (
    <div>
      <h2
        className="text-xl font-bold text-slate-900 mb-6"
        style={{ fontFamily: "Poppins" }}
      >
        Pick a date & time
      </h2>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
        <p className="font-semibold text-slate-700 mb-4">
          {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d, i) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === today.toDateString();
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center p-3 rounded-xl min-w-14 transition-all
                  ${isSelected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-700 hover:bg-blue-50"}`}
              >
                <span className="text-xs font-medium">
                  {DAY_NAMES_SHORT[d.getDay()]}
                </span>
                <span className="text-lg font-bold">{d.getDate()}</span>
                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="font-semibold text-slate-700 mb-4">Available Slots</p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : message && slots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">{message}</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">
              No slots available for this date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <button
                key={slot.time}
                disabled={slot.isBooked}
                onClick={() => setSelectedSlot(slot.time)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all
                  ${
                    slot.isBooked
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : selectedSlot === slot.time
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
                  }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          disabled={!selectedSlot}
          onClick={() =>
            onSelect({ date: selectedDate, timeSlot: selectedSlot })
          }
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white
                     font-semibold text-sm hover:bg-blue-700 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 4 — Confirm ──────────────────────────────────────────────────
function ConfirmBooking({
  service,
  provider,
  date,
  timeSlot,
  onConfirm,
  onBack,
  loading,
  error,
}) {
  const dateStr = `${DAY_NAMES_FULL[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  return (
    <div>
      <h2
        className="text-xl font-bold text-slate-900 mb-6"
        style={{ fontFamily: "Poppins" }}
      >
        Confirm your booking
      </h2>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5">
          <div
            className="w-14 h-14 rounded-full overflow-hidden bg-purple-100 flex items-center
                          justify-center text-xl font-bold text-purple-700 shrink-0"
          >
            {provider.profileImage ? (
              <img
                src={provider.profileImage}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            ) : (
              (provider.name || "P")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{provider.name}</p>
            <p className="text-slate-400 text-sm">{service}</p>
            {provider.address && (
              <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {provider.address}
              </p>
            )}
          </div>
        </div>

        {[
          ["Service", service],
          ["Provider", provider.name],
          ["Date", dateStr],
          ["Time", timeSlot],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
          >
            <span className="text-slate-400 text-sm">{label}</span>
            <span className="font-semibold text-slate-900 text-sm">
              {value}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <p className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

// ── Step 5 — Success ──────────────────────────────────────────────────
function BookingSuccess({ booking, onViewAppointments }) {
  return (
    <div className="text-center py-8">
      <div
        className="w-20 h-20 rounded-full bg-green-100 flex items-center
                      justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2
        className="text-2xl font-bold text-slate-900 mb-2"
        style={{ fontFamily: "Poppins" }}
      >
        Booking Confirmed!
      </h2>
      <p className="text-slate-500 mb-1">
        Your appointment with{" "}
        <span className="font-bold text-slate-900">{booking.providerName}</span>{" "}
        is booked.
      </p>
      <p className="text-slate-400 text-sm mb-8">
        {booking.date} · {booking.timeSlot}
      </p>

      <div className="bg-slate-50 rounded-2xl p-6 text-left max-w-md mx-auto mb-8">
        {[
          ["Service", booking.service],
          ["Provider", booking.providerName],
          ["Date", booking.date],
          ["Time", booking.timeSlot],
          ["Duration", `${booking.duration} min`],
          ["Status", booking.status],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
          >
            <span className="text-slate-400 text-sm">{label}</span>
            <span className="font-semibold text-slate-900 text-sm capitalize">
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onViewAppointments}
        className="w-full max-w-md py-4 rounded-xl bg-blue-600 text-white font-semibold
                   hover:bg-blue-700 transition-colors"
      >
        View My Appointments
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function BookAppointment() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [provider, setProvider] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setError("");
    setLoading(true);
    try {
      const d = dateTime.date;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const res = await fetch(`${API}/api/booking/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId: provider._id,
          specialization: category,
          date: dateStr,
          timeSlot: dateTime.timeSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBooking(data.appointment);
      setStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="Book Appointment">
      <div className="max-w-3xl mx-auto">
        {step < 5 && <Stepper step={step} />}

        {step === 1 && (
          <SelectService
            onSelect={(s) => {
              setCategory(s);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <ChooseProvider
            service={category}
            onSelect={(p) => {
              setProvider(p);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <PickTime
            provider={provider}
            service={category}
            onSelect={(dt) => {
              setDateTime(dt);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ConfirmBooking
            service={category}
            provider={provider}
            date={dateTime.date}
            timeSlot={dateTime.timeSlot}
            onConfirm={handleConfirm}
            onBack={() => setStep(3)}
            loading={loading}
            error={error}
          />
        )}
        {step === 5 && (
          <BookingSuccess
            booking={booking}
            onViewAppointments={() => navigate("/client/appointments")}
          />
        )}
      </div>
    </Shell>
  );
}
