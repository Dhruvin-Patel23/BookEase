export default function Btn({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors";

  const variants = {
    primary: "bg-white text-blue-700 hover:bg-blue-50",
    outline: "border-2 border-white/40 text-white hover:bg-white/10",
    solidWhite: "bg-white text-blue-700 hover:bg-blue-50",
    ghostWhite: "border-2 border-blue-700/20 text-blue-700 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
