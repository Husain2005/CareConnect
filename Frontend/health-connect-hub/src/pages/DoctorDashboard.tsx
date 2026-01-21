import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  LogOut,
  Bell,
  Settings,
  Users,
  TrendingUp,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  date: string;
  type: string;
  status: "pending" | "accepted" | "rejected";
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", patientName: "John Smith", time: "09:00 AM", date: "Today", type: "General Checkup", status: "pending" },
    { id: "2", patientName: "Sarah Johnson", time: "10:30 AM", date: "Today", type: "Follow-up", status: "pending" },
    { id: "3", patientName: "Mike Wilson", time: "02:00 PM", date: "Tomorrow", type: "Consultation", status: "accepted" },
    { id: "4", patientName: "Emily Brown", time: "11:00 AM", date: "Yesterday", type: "Lab Review", status: "accepted" },
  ]);

  const handleAppointmentAction = (id: string, action: "accepted" | "rejected") => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: action } : apt))
    );
  };

  const stats = [
    { label: "Today's Appointments", value: "8", icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: "Pending Requests", value: "3", icon: Clock, color: "bg-accent/10 text-accent" },
    { label: "Total Patients", value: "234", icon: Users, color: "bg-green-100 text-green-600" },
    { label: "This Week", value: "+12%", icon: TrendingUp, color: "bg-blue-100 text-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:block">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">
            Care<span className="text-primary">Connect</span>
          </span>
        </Link>

        <nav className="space-y-2">
          {[
            { icon: Calendar, label: "Dashboard", active: true },
            { icon: Users, label: "Patients" },
            { icon: Clock, label: "Schedule" },
            { icon: Bell, label: "Notifications" },
            { icon: Settings, label: "Settings" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                active
                  ? "gradient-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigate("/")}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Good Morning, Dr. Smith 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your practice today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.label} delay={index * 0.1} hover={false}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Appointments */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <AnimatedCard delay={0.2} hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Pending Requests
              </h2>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                {appointments.filter((a) => a.status === "pending").length} new
              </span>
            </div>

            <div className="space-y-4">
              {appointments
                .filter((apt) => apt.status === "pending")
                .map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.type} • {apt.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAppointmentAction(apt.id, "accepted")}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAppointmentAction(apt.id, "rejected")}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

              {appointments.filter((a) => a.status === "pending").length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No pending requests 🎉
                </p>
              )}
            </div>
          </AnimatedCard>

          {/* Today's Schedule */}
          <AnimatedCard delay={0.3} hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Today's Schedule
              </h2>
              <GradientButton variant="outline" size="sm">
                View All
              </GradientButton>
            </div>

            <div className="space-y-4">
              {appointments
                .filter((apt) => apt.status === "accepted")
                .slice(0, 4)
                .map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl"
                  >
                    <div className="text-center">
                      <p className="font-semibold text-primary">{apt.time}</p>
                      <p className="text-xs text-muted-foreground">{apt.date}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Confirmed</span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
