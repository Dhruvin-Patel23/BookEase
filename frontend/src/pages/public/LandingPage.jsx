import { Calendar, CheckCircle2, Star } from "lucide-react";
import { motion } from "motion/react";
import Btn from "../../components/common/Btn";
import Counter from "../../components/common/Counter";
import { SERVICES, FEATURES } from "../../data/landingData";

function Logo({ light }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
        <Calendar className="w-5 h-5 text-white" />
      </div>
      <span
        className={`font-bold text-xl ${light ? "text-white" : "text-slate-900"}`}
        style={{ fontFamily: "Poppins" }}
      >
        BookEase
      </span>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <a href="#services" className="hover:text-slate-900">
            Services
          </a>
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#contact" className="hover:text-slate-900">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-slate-700 font-medium hover:text-slate-900"
          >
            Log in
          </a>
          <a href="/register">
            <Btn
              variant="primary"
              size="sm"
              className="!bg-blue-600 !text-white hover:!bg-blue-700"
            >
              Sign up free
            </Btn>
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            Trusted by 50,000+ users worldwide
          </div>

          <h1
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "Poppins" }}
          >
            <span className="text-white">Book Appointments</span>
            <br />
            <span className="text-blue-200">Without the Hassle</span>
          </h1>

          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Connect with verified service providers in seconds. Real-time
            availability, instant confirmations, zero phone tag.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <a href="/register">
              <Btn variant="solidWhite" size="lg">
                Get Started Free →
              </Btn>
            </a>
            <a href="/register?role=provider">
              <Btn variant="outline" size="lg">
                I'm a Provider
              </Btn>
            </a>
          </div>

          <div className="flex items-center gap-10">
            <div>
              <div
                className="text-2xl font-extrabold text-white"
                style={{ fontFamily: "Poppins" }}
              >
                <Counter to={50} suffix="K+" />
              </div>
              <div className="text-blue-200 text-sm">Customers</div>
            </div>
            <div>
              <div
                className="text-2xl font-extrabold text-white"
                style={{ fontFamily: "Poppins" }}
              >
                <Counter to={1} suffix="+" />
              </div>
              <div className="text-blue-200 text-sm">Providers</div>
            </div>
            <div>
              <div
                className="text-2xl font-extrabold text-white"
                style={{ fontFamily: "Poppins" }}
              >
                <Counter to={4.9} suffix="★" />
              </div>
              <div className="text-blue-200 text-sm">Avg Rating</div>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <motion.img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=580&h=460&fit=crop&auto=format"
            alt="Provider using BookEase on their phone"
            className="rounded-2xl shadow-2xl w-full object-cover"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-6 left-6 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 max-w-xs"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">
                Appointment Confirmed!
              </div>
              <div className="text-slate-500 text-sm">
                Tomorrow, 10:00 AM with Dr. Mitchell
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BrowseByService() {
  return (
    <section id="services" className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2
          className="text-3xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: "Poppins" }}
        >
          Browse by Service
        </h2>
        <p className="text-slate-500 mb-12">
          Find the right provider for every need
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <span className="text-3xl mb-3">{s.icon}</span>
              <div className="font-semibold text-slate-900">{s.name}</div>
              <div className="text-slate-400 text-sm">{s.count} providers</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyBookEase() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2
          className="text-3xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: "Poppins" }}
        >
          Why BookEase?
        </h2>
        <p className="text-slate-500 mb-12">
          Everything you need, nothing you don't
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-slate-50 rounded-2xl p-6"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold text-slate-900 mt-4 mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABand() {
  return (
    <section
      id="contact"
      className="py-20 text-center"
      style={{
        background: "linear-gradient(135deg, #2563eb 0%, #4338ca 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto px-6">
        <h2
          className="text-3xl font-bold text-white mb-3"
          style={{ fontFamily: "Poppins" }}
        >
          Ready to streamline your bookings?
        </h2>
        <p className="text-blue-100 mb-8">
          Join thousands of happy customers and providers already using
          BookEase.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/register">
            <Btn variant="solidWhite" size="lg">
              Start for Free
            </Btn>
          </a>
          <a href="/login">
            <Btn variant="outline" size="lg">
              Sign In
            </Btn>
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo light />
        <p className="text-slate-400 text-sm">
          © 2026 BookEase, Inc. All rights reserved.
        </p>
        <div className="flex gap-6 text-slate-400 text-sm">
          <a href="/privacy" className="hover:text-white">
            Privacy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms
          </a>
          <a href="/support" className="hover:text-white">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <BrowseByService />
      <WhyBookEase />
      <CTABand />
      <Footer />
    </div>
  );
}
