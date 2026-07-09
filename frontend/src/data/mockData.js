export const MOCK_STATS = {
  totalBooked: 24,
  completed: 18,
  upcoming: 4,
  cancelled: 2,
};

export const MOCK_NEXT_APPOINTMENT = {
  id: "1",
  service: "Dental Checkup",
  provider: "Dr. Sarah Mitchell",
  date: "Jun 25",
  day: "25",
  month: "Jun",
  time: "10:00 AM",
  price: 80,
  status: "confirmed",
};

export const MOCK_APPOINTMENTS = [
  {
    id: "1",
    initials: "AI",
    service: "Dental Checkup",
    status: "confirmed",
    provider: "Dr. Sarah Mitchell",
    date: "Jun 25, 2026",
    time: "10:00 AM",
    price: 80,
  },
  {
    id: "2",
    initials: "AI",
    service: "Tooth Cleaning",
    status: "confirmed",
    provider: "Dr. Sarah Mitchell",
    date: "Jun 28, 2026",
    time: "03:00 PM",
    price: 80,
  },
  {
    id: "3",
    initials: "AI",
    service: "Personal Training",
    status: "confirmed",
    provider: "James Torres",
    date: "Jun 24, 2026",
    time: "09:00 AM",
    price: 60,
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    icon: "✓",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Appointment Confirmed",
    message:
      "Your dental checkup with Dr. Sarah Mitchell is confirmed for Jun 25 at 10:00 AM.",
    unread: true,
  },
  {
    id: "2",
    icon: "🔔",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Appointment Reminder",
    message:
      "You have a personal training session with James Torres tomorrow at 9:00 AM. Don't forget!",
    unread: true,
  },
  {
    id: "3",
    icon: "🔔",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    title: "Provider Schedule Updated",
    message:
      "Priya Sharma has updated her availability. New slots are open for next week.",
    unread: false,
  },
];

export const SERVICES = [
  "Hair & Beauty",
  "Dental Care",
  "Medical",
  "Fitness",
  "Massage",
  "Nutrition",
];
export const PROVIDERS = ["Dr. Sarah Mitchell", "James Torres", "Priya Sharma"];
