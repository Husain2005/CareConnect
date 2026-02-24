import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Calendar,
  Clock,
  Bell,
  Settings,
  Users,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

type Appointment = {
  _id: string;
  date: string;
  time: string;
  symptoms?: string;
  status: string;
  patientId?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
};

const DoctorPatients = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

        if (!response.ok) throw new Error("Failed to fetch patients");
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Could not load patients");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate, token]);

  const uniquePatients = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; lastVisit: string; reason: string }>();

    appointments.forEach((apt) => {
      const id = apt.patientId?._id;
      if (!id) return;

      if (!map.has(id)) {
        map.set(id, {
          name: apt.patientId?.name || "Patient",
          email: apt.patientId?.email || "-",
          phone: apt.patientId?.phone || "-",
          lastVisit: `${apt.date} ${apt.time}`,
          reason: apt.symptoms || "Consultation",
        });
      }
    });

    return Array.from(map.entries()).map(([id, patient]) => ({ id, ...patient }));
  }, [appointments]);

  return (
    <>
      {/* Content renders inside DashboardLayout main/outlet */}
        <DashboardHeader
          role="doctor"
          title="Patients"
          subtitle="All patients from your appointment history."
          notificationCount={appointments.filter((a) => a.status === "pending").length}
        />

        {loading && <p className="text-muted-foreground">Loading patients...</p>}

        {!loading && (
          <div className="grid gap-4">
            {uniquePatients.map((patient) => (
              <AnimatedCard key={patient.id} hover={false}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary border border-border rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">Last Visit: {patient.lastVisit}</p>
                      <p className="text-sm text-muted-foreground">{patient.reason}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2 justify-end"><Mail className="w-4 h-4" /> {patient.email}</p>
                    <p className="flex items-center gap-2 justify-end"><Phone className="w-4 h-4" /> {patient.phone}</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}

            {uniquePatients.length === 0 && (
              <p className="text-muted-foreground text-center py-6">No patient records yet.</p>
            )}
          </div>
        )}
    </>
  );
};

export default DoctorPatients;
