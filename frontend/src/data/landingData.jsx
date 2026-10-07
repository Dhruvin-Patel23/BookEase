import { Zap, Bell, ShieldCheck, Calendar, CreditCard, BarChart2 } from "lucide-react";

export const SERVICES = [
  { icon: "✂️", name: "Hair & Beauty", count: 48 },
  { icon: "🦷", name: "Dental Care", count: 32 },
  { icon: "🏥", name: "Medical", count: 61 },
  { icon: "💪", name: "Fitness", count: 27 },
  { icon: "💆", name: "Massage", count: 19 },
  { icon: "🥗", name: "Nutrition", count: 14 },
];

export const FEATURES = [
  {
    icon: Zap,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Instant Booking",
    desc: "Book confirmed in under 60 seconds with real-time slot availability.",
  },
  {
    icon: Bell,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Smart Reminders",
    desc: "Automated notifications so you never forget an upcoming session.",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Verified Providers",
    desc: "Background-checked professionals with transparent ratings and reviews.",
  },
  {
    icon: Calendar,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Manage Anywhere",
    desc: "Reschedule or cancel in one tap from any device.",
  },
  {
    icon: CreditCard,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    title: "Secure Payments",
    desc: "Pay safely online or in person — your data is always protected.",
  },
  {
    icon: BarChart2,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "Provider Analytics",
    desc: "Providers get rich insights into bookings, revenue, and client trends.",
  },
];
