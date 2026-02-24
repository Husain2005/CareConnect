import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Settings,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://careconnect-ai-ra76.onrender.com";

type Appointment = {
  _id: string;
  patientId?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  date: string;
  time: string;
  notes?: string;
  symptoms?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Doctor";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login&role=doctor");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctor/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Could not load doctor dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, token]);

  const pendingAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === "pending"),
    [appointments]
  );

  const confirmedAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === "confirmed"),
    [appointments]
  );

  const today = new Date().toISOString().split("T")[0];

  const stats = [
    { label: "Today's Appointments", value: appointments.filter((a) => a.date === today).length, icon: Calendar },
    { label: "Pending Requests", value: pendingAppointments.length, icon: Clock },
    { label: "Total Patients", value: new Set(appointments.map((a) => a.patientId?._id).filter(Boolean)).size, icon: Users },
    { label: "Confirmed", value: confirmedAppointments.length, icon: TrendingUp },
  ];

  const handleAppointmentAction = async (
    id: string,
    action: "confirmed" | "cancelled"
  ) => {
    if (!token) return;
    setUpdatingId(id);

    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update appointment");
      }

      setAppointments((prev) =>
        prev.map((apt) => (apt._id === id ? { ...apt, status: action } : apt))
      );
      toast.success(`Appointment ${action}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {/* Content renders inside DashboardLayout main/outlet */}
        <DashboardHeader
          role="doctor"
          title={`Good day, ${userName}`}
          subtitle="Practice overview and appointment actions."
          notificationCount={pendingAppointments.length}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <AnimatedCard key={stat.label} hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center border border-border">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pending Requests
              </h2>
              <span className="px-3 py-1 bg-secondary text-foreground rounded-full text-sm font-medium border border-border">
                {pendingAppointments.length} pending
              </span>
            </div>

            <div className="space-y-4">
              {loading && <p className="text-muted-foreground">Loading appointments...</p>}

              {!loading &&
                pendingAppointments.map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-4 bg-secondary/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{apt.patientId?.name || "Patient"}</p>
                        <p className="text-sm text-muted-foreground">{apt.date} • {apt.time}</p>
                        {apt.notes && <p className="text-xs text-muted-foreground">{apt.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={updatingId === apt._id}
                        onClick={() => handleAppointmentAction(apt._id, "confirmed")}
                        className="p-2 bg-secondary border border-border text-primary rounded-lg disabled:opacity-50"
                        title="Confirm"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        disabled={updatingId === apt._id}
                        onClick={() => handleAppointmentAction(apt._id, "cancelled")}
                        className="p-2 bg-secondary border border-border text-destructive rounded-lg disabled:opacity-50"
                        title="Cancel"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

              {!loading && pendingAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No pending requests</p>
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Confirmed Schedule
              </h2>
              <GradientButton variant="outline" size="sm" onClick={() => navigate("/dashboard/doctor/schedule")}>View All</GradientButton>
            </div>

            <div className="space-y-4">
              {confirmedAppointments.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center gap-4 p-4 bg-secondary/60 rounded-xl">
                  <div className="text-center min-w-20">
                    <p className="font-semibold text-primary">{apt.time}</p>
                    <p className="text-xs text-muted-foreground">{apt.date}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{apt.patientId?.name || "Patient"}</p>
                    <p className="text-sm text-muted-foreground">{apt.symptoms || "Consultation"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Confirmed</span>
                  </div>
                </div>
              ))}

              {!loading && confirmedAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No confirmed appointments</p>
              )}
            </div>
          </AnimatedCard>
        </div>
    </>
  );
};

export default DoctorDashboard;
