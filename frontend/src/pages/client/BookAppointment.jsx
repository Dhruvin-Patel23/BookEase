import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
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
  const steps = [
    "Select Service",
    "Choose Provider",
    "Select Service",
    "Pick Time",
    "Confirm",
  ];
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
              className={`text-sm font-medium ${
                current
                  ? "text-blue-600"
                  : done
                    ? "text-green-600"
                    : "text-slate-400"
              }`}
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

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(
          `${API}/api/booking/providers?specialization=${encodeURIComponent(service)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setProviders(data.providers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, [service]);

  return (
    <div>
      <h2
        className="text-xl font-bold text-slate-900 mb-6"
        style={{ fontFamily: "Poppins" }}
      >
        Choose a provider
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
            return (
              <button
                key={p._id}
                onClick={() => onSelect(p)}
                className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm
                           p-5 flex items-center gap-4 hover:border-blue-300
                           hover:shadow-md transition-all text-left"
              >
                <div
                  className="w-14 h-14 rounded-full bg-purple-100 flex items-center
                                justify-center shrink-0 text-xl font-bold text-purple-700"
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.isAvailable ? "Available" : "Busy"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {p.specializations?.join(", ") ||
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
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
              </button>
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

// ── Step 2.5 — Select Specific Specialization from Provider ──────────
function SelectSpecialization({ provider, onSelect, onBack }) {
  const specializations = provider.specializations || [];

  return (
    <div>
      <h2
        className="text-xl font-bold text-slate-900 mb-2"
        style={{ fontFamily: "Poppins" }}
      >
        Select a service
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        Choose the specific service you need from{" "}
        <span className="font-semibold text-slate-700">{provider.name}</span>
      </p>

      {specializations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-semibold text-slate-900">No services listed</p>
          <p className="text-slate-400 text-sm mt-1">
            This provider hasn't added their specializations yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {specializations.map((spec) => {
            // show duration override if available
            const durations = provider.availability?.serviceDurations || {};
            const defaultDur = provider.availability?.defaultDuration || 30;
            const duration = durations[spec] || defaultDur;

            return (
              <button
                key={spec}
                onClick={() => onSelect(spec)}
                className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm
                           p-5 flex items-center justify-between hover:border-blue-300
                           hover:shadow-md transition-all text-left"
              >
                <div>
                  <p className="font-semibold text-slate-900">{spec}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Session duration: {duration} min
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
              </button>
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

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  async function fetchSlots(date) {
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
  }

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
                  ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-blue-50"
                  }`}
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
        {/* Provider summary */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-5">
          <div
            className="w-14 h-14 rounded-full bg-purple-100 flex items-center
                          justify-center text-xl font-bold text-purple-700"
          >
            {(provider.name || "P")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
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
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
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
  const [category, setCategory] = useState(null); // broad category e.g. "Fitness"
  const [provider, setProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null); // exact spec e.g. "General Fitness"
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
          specialization: selectedService, // exact service, not category
          date: dateStr,
          timeSlot: dateTime.timeSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBooking(data.appointment);
      setStep(6);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell title="Book Appointment">
      <div className="max-w-3xl mx-auto">
        {step < 6 && <Stepper step={step} />}

        {/* Step 1 — Pick category */}
        {step === 1 && (
          <SelectService
            onSelect={(s) => {
              setCategory(s);
              setStep(2);
            }}
          />
        )}

        {/* Step 2 — Pick provider filtered by category */}
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

        {/* Step 3 — Pick exact specialization from that provider */}
        {step === 3 && (
          <SelectSpecialization
            provider={provider}
            onSelect={(spec) => {
              setSelectedService(spec);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {/* Step 4 — Pick date & time (slots use exact service duration) */}
        {step === 4 && (
          <PickTime
            provider={provider}
            service={selectedService}
            onSelect={(dt) => {
              setDateTime(dt);
              setStep(5);
            }}
            onBack={() => setStep(3)}
          />
        )}

        {/* Step 5 — Confirm */}
        {step === 5 && (
          <ConfirmBooking
            service={selectedService}
            provider={provider}
            date={dateTime.date}
            timeSlot={dateTime.timeSlot}
            onConfirm={handleConfirm}
            onBack={() => setStep(4)}
            loading={loading}
            error={error}
          />
        )}

        {/* Step 6 — Success */}
        {step === 6 && (
          <BookingSuccess
            booking={booking}
            onViewAppointments={() => navigate("/client/appointments")}
          />
        )}
      </div>
    </Shell>
  );
}
