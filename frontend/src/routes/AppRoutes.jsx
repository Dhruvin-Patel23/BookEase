import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import PrivacyPage from "../pages/public/PrivacyPage";
import TermsPage from "../pages/public/TermsPage";
import SupportPage from "../pages/public/SupportPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";

import ClientDashboard from "../pages/client/Dashboard";

import ProviderDashboard from "../pages/provider/Dashboard";
import ProviderProfile from "../pages/provider/Profile";
import AvailabilityManager from "../pages/provider/AvailabilityManager";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/*client routes*/}
        <Route path="/client/dashboard" element={<ClientDashboard />} />

        {/*provider routes*/}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route
          path="/provider/availability"
          element={<AvailabilityManager />}
        />
        {/* more routes added as we build each page */}
      </Routes>
    </BrowserRouter>
  );
}
