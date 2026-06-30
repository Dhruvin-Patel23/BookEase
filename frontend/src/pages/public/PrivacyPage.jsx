import { Calendar } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-bold text-xl text-slate-900"
            style={{ fontFamily: "Poppins" }}
          >
            BookEase
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1
          className="text-3xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: "Poppins" }}
        >
          Privacy Policy
        </h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as your
              name, email address, and appointment details, as well as usage
              data to help us improve BookEase.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              How We Use Your Information
            </h2>
            <p>
              Your information is used to facilitate bookings, send reminders,
              and improve the reliability and security of our service. We do not
              sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Your Choices
            </h2>
            <p>
              You can update or delete your account information at any time from
              your dashboard, or contact our support team for assistance.
            </p>
          </section>
        </div>

        <a
          href="/"
          className="inline-block mt-12 text-blue-600 font-medium hover:underline"
        >
          ← Back to home
        </a>
      </main>
    </div>
  );
}
