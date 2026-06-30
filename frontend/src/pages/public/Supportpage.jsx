import { Calendar, Mail, MessageCircle, HelpCircle } from "lucide-react";

export default function SupportPage() {
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
          Support
        </h1>
        <p className="text-slate-500 mb-10">
          Need help with a booking, your account, or something else? We're here
          for you.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <Mail className="w-6 h-6 text-blue-600 mx-auto mb-3" />
            <div className="font-semibold text-slate-900 mb-1">Email Us</div>
            <p className="text-slate-500 text-sm">support@bookease.com</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-3" />
            <div className="font-semibold text-slate-900 mb-1">Live Chat</div>
            <p className="text-slate-500 text-sm">Mon–Fri, 9am–6pm</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <HelpCircle className="w-6 h-6 text-blue-600 mx-auto mb-3" />
            <div className="font-semibold text-slate-900 mb-1">Help Center</div>
            <p className="text-slate-500 text-sm">Browse common questions</p>
          </div>
        </div>

        <section className="space-y-6 text-slate-600 leading-relaxed">
          <h2 className="text-lg font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div>
            <h3 className="font-medium text-slate-900 mb-1">
              How do I cancel an appointment?
            </h3>
            <p>
              Go to "My Appointments" in your dashboard and select cancel on the
              relevant booking.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-1">
              How do I become a provider?
            </h3>
            <p>
              Sign up and select "I'm a Provider" during registration to set up
              your provider profile.
            </p>
          </div>
        </section>

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
