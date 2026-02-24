import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Calendar, Clock, CheckCircle, User } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

type Appointment = {
  _id: string;
  date: string;
  time: string;
  symptoms?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  patientId?: { name?: string };
};

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login&role=doctor");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctor/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Could not load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, token]);

  const today = new Date().toISOString().split("T")[0];

  const todaysAppointments = useMemo(
    () => appointments.filter((apt) => apt.date === today),
    [appointments, today]
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((apt) => apt.date > today),
    [appointments, today]
  );

  const renderAppointment = (apt: Appointment) => (
    <div key={apt._id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border">
      <div className="text-center min-w-20">
        <p className="font-semibold text-primary">{apt.time}</p>
        <p className="text-xs text-muted-foreground">{apt.date}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{apt.patientId?.name || "Patient"}</p>
        <p className="text-sm text-muted-foreground">{apt.symptoms || "Consultation"}</p>
      </div>
      <div className="flex items-center gap-1 text-primary">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs font-medium capitalize">{apt.status}</span>
      </div>
    </div>
  );

  return (
    <>
      <DashboardHeader role="doctor" title="Schedule" subtitle="Manage today and upcoming appointments." notificationCount={appointments.filter((a) => a.status === "pending").length} />

      {loading ? (
        <p className="text-muted-foreground">Loading schedule...</p>
      ) : (
        <div className="grid gap-6">
          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Today's Appointments</h2>
              <span className="px-3 py-1 bg-secondary text-foreground rounded-full text-sm font-medium border border-border">
                {todaysAppointments.length} appointments
              </span>
            </div>

            <div className="space-y-4">
              {todaysAppointments.map(renderAppointment)}
              {todaysAppointments.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No appointments today.</p>
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Upcoming Appointments</h2>
              <span className="px-3 py-1 bg-secondary text-foreground rounded-full text-sm font-medium border border-border">
                {upcomingAppointments.length} appointments
              </span>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map(renderAppointment)}
              {upcomingAppointments.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No upcoming appointments.</p>
              )}
            </div>
          </AnimatedCard>
        </div>
      )}
    </>
  );
};

export default DoctorSchedule;
