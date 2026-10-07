import { Calendar } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Using BookEase
            </h2>
            <p>
              By creating an account, you agree to use BookEase only for lawful
              booking and scheduling purposes, and to provide accurate
              information when registering or booking an appointment.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Cancellations
            </h2>
            <p>
              Customers and providers are responsible for honoring confirmed
              appointments. Repeated no-shows or cancellations may result in
              account restrictions.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Liability
            </h2>
            <p>
              BookEase connects customers with independent providers and is not
              responsible for the quality of services rendered outside the
              platform.
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
