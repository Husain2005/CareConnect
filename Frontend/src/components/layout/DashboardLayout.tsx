import { Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import {
  Calendar,
  Search,
  Clock,
  FileText,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";

export const DashboardLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isDoctor = location.pathname.startsWith("/dashboard/doctor");

  const doctorItems = [
    { icon: Calendar, label: "Dashboard", route: "/dashboard/doctor" },
    { icon: Users, label: "Patients", route: "/dashboard/doctor/patients" },
    { icon: Clock, label: "Schedule", route: "/dashboard/doctor/schedule" },
    { icon: Settings, label: "Settings", route: "/dashboard/doctor/settings" },
  ];

  const patientItems = [
    { icon: Calendar, label: "Dashboard", route: "/dashboard/patient" },
    { icon: Search, label: "Find Doctors", route: "/dashboard/patient/find-doctors" },
    { icon: Clock, label: "Appointments", route: "/dashboard/patient/book" },
    { icon: FileText, label: "Reports", route: "/dashboard/patient/reports" },
    // { icon: MessageCircle, label: "AI Chat", route: "/dashboard/patient/chat" },
    { icon: Settings, label: "Settings", route: "/dashboard/patient/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        activePath={location.pathname}
        items={isDoctor ? doctorItems : patientItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <main className={`${collapsed ? "ml-24" : "ml-64"} min-h-screen bg-secondary/20 transition-all duration-200`}>
        <div className="max-w-7xl mx-auto p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
