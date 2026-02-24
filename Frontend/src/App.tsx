import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { FloatingHealthChatbot } from "./components/chat/FloatingHealthChatbot";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import AuthPage from "./pages/AuthPage";
import ChatbotPage from "./pages/ChatbotPage";
import ReportAnalyzerPage from "./pages/ReportAnalyzerPage";
import BookingPage from "./pages/BookingPage";
import FindDoctorsPage from "./pages/FindDoctorsPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorSchedule from "./pages/DoctorSchedule";
import DoctorNotifications from "./pages/DoctorNotifications";
import DoctorSettings from "./pages/DoctorSettings";
import PatientDashboard from "./pages/PatientDashboard";
import PatientNotifications from "./pages/PatientNotifications";
import PatientSettings from "./pages/PatientSettings";
import EmergencyChatPage from "./pages/EmergencyChatPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="always">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/chatbot" element={<Navigate to="/dashboard/patient/chat" replace />} />
            <Route path="/report-analyzer" element={<Navigate to="/dashboard/patient/reports" replace />} />
            <Route path="/book" element={<Navigate to="/dashboard/patient/find-doctors" replace />} />
            <Route path="/dashboard">
              <Route path="doctor" element={<DashboardLayout />}> 
                <Route index element={<DoctorDashboard />} />
                <Route path="patients" element={<DoctorPatients />} />
                <Route path="schedule" element={<DoctorSchedule />} />
                <Route path="emergency" element={<EmergencyChatPage />} />
                <Route path="notifications" element={<DoctorNotifications />} />
                <Route path="settings" element={<DoctorSettings />} />
              </Route>
              <Route path="patient" element={<DashboardLayout />}> 
                <Route index element={<PatientDashboard />} />
                <Route path="find-doctors" element={<FindDoctorsPage />} />
                <Route path="book" element={<BookingPage />} />
                <Route path="reports" element={<ReportAnalyzerPage />} />
                <Route path="chat" element={<ChatbotPage />} />
                <Route path="emergency" element={<EmergencyChatPage />} />
                <Route path="notifications" element={<PatientNotifications />} />
                <Route path="settings" element={<PatientSettings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingHealthChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
