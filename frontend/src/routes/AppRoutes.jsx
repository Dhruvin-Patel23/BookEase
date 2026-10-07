import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "../context/NotificationContext";
import LandingPage from "../pages/public/LandingPage";
import PrivacyPage from "../pages/public/PrivacyPage";
import TermsPage from "../pages/public/TermsPage";
import SupportPage from "../pages/public/SupportPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";

import ClientDashboard from "../pages/client/Dashboard";
import BookAppointment from "../pages/client/BookAppointment";
import ClientProfile from "../pages/client/Profile";
import ClientAppointments from "../pages/client/Appointments";
import ClientNotifications from "../pages/client/Notifications";

import ProviderDashboard from "../pages/provider/Dashboard";
import ProviderProfile from "../pages/provider/Profile";
import AvailabilityManager from "../pages/provider/AvailabilityManager";
import ProviderAppointments from "../pages/provider/Appointments";
import ProviderReviews from "../pages/provider/Reviews";
import ProviderNotifications from "../pages/provider/Notifications";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Client */}
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/book" element={<BookAppointment />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          <Route path="/client/appointments" element={<ClientAppointments />} />
          <Route path="/client/notifications" element={<ClientNotifications />} />

          {/* Provider */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route path="/provider/availability" element={<AvailabilityManager />} />
          <Route path="/provider/appointments" element={<ProviderAppointments />} />
          <Route path="/provider/reviews" element={<ProviderReviews />} />
          <Route path="/provider/notifications" element={<ProviderNotifications />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}
