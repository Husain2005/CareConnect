import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  Heart,
  Calendar,
  Clock,
  MessageCircle,
  FileText,
  User,
  LogOut,
  Bell,
  Settings,
  Search,
  Star,
  ChevronRight,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: string;
  image?: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const doctors: Doctor[] = [
    { id: "1", name: "Dr. Sarah Williams", specialty: "Cardiologist", rating: 4.9, available: "Today" },
    { id: "2", name: "Dr. Michael Chen", specialty: "Dermatologist", rating: 4.8, available: "Tomorrow" },
    { id: "3", name: "Dr. Emily Brown", specialty: "General Physician", rating: 4.7, available: "Today" },
    { id: "4", name: "Dr. James Wilson", specialty: "Neurologist", rating: 4.9, available: "Wed, Jan 15" },
  ];

  const appointments: Appointment[] = [
    { id: "1", doctorName: "Dr. Sarah Williams", specialty: "Cardiologist", time: "10:00 AM", date: "Today", status: "upcoming" },
    { id: "2", doctorName: "Dr. Emily Brown", specialty: "General Physician", time: "2:00 PM", date: "Jan 20", status: "upcoming" },
    { id: "3", doctorName: "Dr. Michael Chen", specialty: "Dermatologist", time: "11:00 AM", date: "Jan 10", status: "completed" },
  ];

  const quickActions = [
    { icon: Calendar, label: "Book Appointment", path: "/book", color: "gradient-primary" },
    { icon: MessageCircle, label: "Chat with AI", path: "/chatbot", color: "gradient-accent" },
    { icon: FileText, label: "Analyze Report", path: "/report-analyzer", color: "bg-green-500" },
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
            { icon: Search, label: "Find Doctors" },
            { icon: Clock, label: "Appointments" },
            { icon: FileText, label: "Reports" },
            { icon: MessageCircle, label: "AI Chat" },
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
              Welcome back, John 👋
            </h1>
            <p className="text-muted-foreground">
              How can we help you today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <Link key={action.label} to={action.path}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`${action.color} p-6 rounded-2xl text-center cursor-pointer`}
              >
                <action.icon className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="font-medium text-white text-sm">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search doctors, specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-secondary rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <AnimatedCard delay={0.3} hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Upcoming Appointments
              </h2>
              <GradientButton variant="outline" size="sm">
                View All
              </GradientButton>
            </div>

            <div className="space-y-4">
              {appointments
                .filter((apt) => apt.status === "upcoming")
                .map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{apt.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{apt.time}</p>
                      <p className="text-sm text-muted-foreground">{apt.date}</p>
                    </div>
                  </motion.div>
                ))}

              {appointments.filter((a) => a.status === "upcoming").length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <GradientButton variant="primary" size="sm">
                    Book Now
                  </GradientButton>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Available Doctors */}
          <AnimatedCard delay={0.4} hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Available Doctors
              </h2>
              <GradientButton variant="outline" size="sm">
                See All
              </GradientButton>
            </div>

            <div className="space-y-4">
              {doctors.slice(0, 3).map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                      <p className="text-xs text-green-600">{doctor.available}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Health Tips Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 gradient-primary rounded-2xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <MessageCircle className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <div>
              <h3 className="font-display font-semibold text-primary-foreground text-lg">
                Have health questions?
              </h3>
              <p className="text-primary-foreground/80">
                Chat with our AI assistant 24/7
              </p>
            </div>
          </div>
          <Link to="/chatbot">
            <GradientButton
              variant="outline"
              className="bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30"
            >
              Start Chat
            </GradientButton>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default PatientDashboard;
