import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Calendar,
  Clock,
  Settings,
  Search,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://careconnect-ai-ra76.onrender.com";

type Appointment = {
  _id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  doctorId?: {
    name?: string;
  };
};

const PatientNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login&role=patient");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to load notifications");

        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Could not load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, token]);

  const notifications = useMemo(
    () =>
      appointments.map((apt) => ({
        id: apt._id,
        title: `Appointment ${apt.status}`,
        message: `Dr. ${apt.doctorId?.name || "Doctor"} • ${apt.date} at ${apt.time}`,
      })),
    [appointments]
  );

  return (
    <>
      <DashboardHeader
        role="patient"
        title="Notifications"
        subtitle="Latest updates from your appointments."
        notificationCount={notifications.length}
      />

        {loading ? (
          <p className="text-muted-foreground">Loading notifications...</p>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <AnimatedCard key={notification.id} hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full mt-2 bg-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}

            {notifications.length === 0 && (
              <p className="text-muted-foreground text-center py-6">No notifications yet.</p>
            )}
          </div>
        )}
    </>
  );
};

export default PatientNotifications;
