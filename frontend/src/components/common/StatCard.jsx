import { useEffect, useState } from "react";

export default function StatCard({ label, value, icon, iconBg, delta }) {
  const [count, setCount] = useState(0);

  // count-up animation
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className="text-3xl font-bold text-slate-900"
          style={{ fontFamily: "Poppins" }}
        >
          {count}
        </p>
        {delta && (
          <p className="text-xs text-green-600 font-medium mt-1">{delta}</p>
        )}
      </div>
    </div>
  );
}
