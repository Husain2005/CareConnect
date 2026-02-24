import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  role: "doctor" | "patient";
  notificationCount?: number;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";

export const DashboardHeader = ({ title, subtitle, role, notificationCount = 0 }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // emergency button removed per request

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const endpoint = role === "doctor" ? "/api/doctor/appointments" : "/api/appointments/my";
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to load notifications");

        const data = await response.json();
        const notifications = (Array.isArray(data) ? data : []).slice(0, 12).map((apt: any) => ({
          id: apt._id,
          title: `Appointment ${apt.status}`,
          message:
            role === "doctor"
              ? `${apt?.patientId?.name || "Patient"} • ${apt.date} at ${apt.time}`
              : `Dr. ${apt?.doctorId?.name || "Doctor"} • ${apt.date} at ${apt.time}`,
        }));

        setItems(notifications);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [open, role]);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border mb-6">
      <div className="py-4 flex items-center justify-between gap-4 relative" ref={panelRef}>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {/* Emergency button removed from header */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative p-2 rounded-xl bg-card border border-border"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-primary" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {Math.min(notificationCount, 9)}
              </span>
            )}
          </button>
        </div>

        {open && (
          <div className="absolute right-0 top-16 w-[340px] max-w-[90vw] rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-secondary" title="Close notifications">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              {loading ? (
                <p className="px-2 py-6 text-sm text-center text-muted-foreground">Loading notifications...</p>
              ) : items.length === 0 ? (
                <p className="px-2 py-6 text-sm text-center text-muted-foreground">No notifications yet.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl hover:bg-secondary/60">
                    <p className="text-sm font-medium text-foreground capitalize">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
