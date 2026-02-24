import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Calendar,
  Clock,
  FileText,
  User,
  Settings,
  Search,
  Star,
  ChevronRight,
  Stethoscope,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

type Doctor = {
  _id: string;
  name: string;
  specialty: string;
  rating: number;
  available: string[];
};

type Appointment = {
  _id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  doctorId?: {
    _id: string;
    name: string;
    specialty?: string;
    rating?: number;
    available?: string[];
  };
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponeTarget, setPostponeTarget] = useState<Appointment | null>(null);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeTime, setPostponeTime] = useState("");
  const [postponing, setPostponing] = useState(false);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "Patient";

  const openPostponeDialog = (appointment: Appointment) => {
    setPostponeTarget(appointment);
    setPostponeDate(appointment.date);
    setPostponeTime(appointment.time);
    setPostponeOpen(true);
  };

  const handlePostpone = async () => {
    if (!token) return;
    if (!postponeTarget || !postponeDate || !postponeTime) return;

    try {
      setPostponing(true);
      const response = await fetch(`${API_URL}/api/appointments/${postponeTarget._id}/postpone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: postponeDate, time: postponeTime }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to postpone appointment");

      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === postponeTarget._id
            ? { ...apt, date: postponeDate, time: postponeTime, status: "pending" }
            : apt
        )
      );
      toast.success("Appointment postponed successfully");
      setPostponeOpen(false);
      setPostponeTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to postpone appointment");
    } finally {
      setPostponing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login&role=patient");
      return;
    }

    const fetchData = async () => {
      try {
        const [doctorsRes, appointmentsRes] = await Promise.all([
          fetch(`${API_URL}/api/doctor`),
          fetch(`${API_URL}/api/appointments/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!doctorsRes.ok) {
          throw new Error("Failed to load doctors");
        }

        if (!appointmentsRes.ok) {
          throw new Error("Failed to load appointments");
        }

        const doctorsData = await doctorsRes.json();
        const appointmentsData = await appointmentsRes.json();

        setDoctors(Array.isArray(doctorsData) ? doctorsData : (doctorsData.items || []));
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (error) {
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const upcomingAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === "pending" || apt.status === "confirmed"),
    [appointments]
  );

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
    );
  }, [doctors, searchQuery]);

  const quickActions = [
    { icon: Search, label: "Find Doctors", path: "/dashboard/patient/find-doctors" },
    { icon: Calendar, label: "Book Appointment", path: "/dashboard/patient/book" },
    { icon: FileText, label: "Analyze Report", path: "/dashboard/patient/reports" },
  ];

  return (
    <>
        <DashboardHeader
          role="patient"
          title={`Welcome back, ${userName}`}
          subtitle="Your care summary in one place."
          notificationCount={upcomingAppointments.length}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path}>
              <div className="bg-card p-6 rounded-2xl border border-border text-center hover:bg-secondary">
                <action.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground text-sm">{action.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search doctors or specialties"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </h2>
              <GradientButton variant="outline" size="sm" onClick={() => navigate("/dashboard/patient/book")}>View All</GradientButton>
            </div>

            <div className="space-y-4">
              {loading && <p className="text-muted-foreground">Loading appointments...</p>}

              {!loading &&
                upcomingAppointments.slice(0, 4).map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-4 bg-secondary/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-card rounded-xl flex items-center justify-center border border-border">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{apt.doctorId?.name || "Doctor"}</p>
                        <p className="text-sm text-muted-foreground">{apt.doctorId?.specialty || "Specialist"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{apt.time}</p>
                      <p className="text-sm text-muted-foreground">{apt.date}</p>
                      <button
                        onClick={() => openPostponeDialog(apt)}
                        className="mt-2 text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary"
                      >
                        Postpone
                      </button>
                    </div>
                  </div>
                ))}

              {!loading && upcomingAppointments.length === 0 && (
                <div className="text-center py-6">
                  <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <GradientButton variant="primary" size="sm" onClick={() => navigate("/dashboard/patient/book")}>Book Now</GradientButton>
                </div>
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Doctors
              </h2>
              <GradientButton variant="outline" size="sm" onClick={() => navigate("/dashboard/patient/find-doctors")}>Open Directory</GradientButton>
            </div>

            <div className="space-y-4">
              {loading && <p className="text-muted-foreground">Loading doctors...</p>}

              {!loading &&
                filteredDoctors.slice(0, 4).map((doctor) => (
                  <div key={doctor._id} className="flex items-center justify-between p-4 bg-secondary/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-card rounded-xl flex items-center justify-center border border-border">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-primary">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-medium">{doctor.rating || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {doctor.available?.length || 0} slots
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}

              {!loading && filteredDoctors.length > 0 && (
                <button
                  onClick={() => navigate("/dashboard/patient/find-doctors")}
                  className="w-full py-3 rounded-xl border border-border text-foreground hover:bg-secondary"
                >
                  Browse all {filteredDoctors.length} doctors
                </button>
              )}

              {!loading && filteredDoctors.length === 0 && (
                <div className="text-center py-6">
                  <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No doctors match your search</p>
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>

        <div className="mt-8 bg-card rounded-2xl border border-border p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-primary" />
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg">
                Need quick help?
              </h3>
              <p className="text-muted-foreground">Use AI chat for guidance anytime.</p>
            </div>
          </div>
          <GradientButton variant="primary" onClick={() => navigate("/dashboard/patient/chat")}>Start Chat</GradientButton>
        </div>

        {postponeOpen && postponeTarget && (
          <div className="fixed inset-0 z-50">
            <button className="absolute inset-0 bg-black/40" onClick={() => setPostponeOpen(false)} aria-label="Close postpone dialog" />
            <div className="absolute inset-x-4 top-24 mx-auto max-w-md bg-card border border-border rounded-2xl p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Postpone Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">New Date</label>
                  <input
                    type="date"
                    value={postponeDate}
                    onChange={(event) => setPostponeDate(event.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">New Time</label>
                  <select
                    value={postponeTime}
                    onChange={(event) => setPostponeTime(event.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                  >
                    {(postponeTarget.doctorId?.available || [postponeTarget.time]).map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setPostponeOpen(false)}
                  className="px-3 py-2 rounded-xl border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostpone}
                  disabled={postponing || !postponeDate || !postponeTime}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {postponing ? "Saving..." : "Confirm Postpone"}
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default PatientDashboard;
