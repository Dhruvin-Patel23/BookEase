const STYLES = {
  confirmed: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100  text-red-600",
};

export default function Pill({ status }) {
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STYLES[status] || STYLES.pending}`}
    >
      {status}
    </span>
  );
}
