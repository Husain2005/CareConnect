import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Calendar,
  Clock,
  Settings,
  Users,
  User,
  Save,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

const DoctorSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    experience: "",
    bio: "",
    available: "",
    subCity: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login&role=doctor");
      return;
    }

    const fetchSettings = async () => {
      try {
        const [userRes, doctorRes] = await Promise.all([
          fetch(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/doctor/profile/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!userRes.ok) throw new Error("Failed to load user profile");
        const userData = await userRes.json();

        let doctorData: any = {};
        if (doctorRes.ok) {
          doctorData = await doctorRes.json();
        }

        setFormData({
          name: userData.user?.name || "",
          email: userData.user?.email || "",
          specialty: doctorData.specialty || "",
          experience: doctorData.experience || "",
          bio: doctorData.bio || "",
          available: Array.isArray(doctorData.available) ? doctorData.available.join(", ") : "",
          subCity: doctorData.address?.subCity || "",
          city: doctorData.address?.city || "",
          country: doctorData.address?.country || "",
        });
      } catch (error) {
        toast.error("Could not load doctor settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate, token]);

  const saveSettings = async () => {
    if (!token) return;
    setSaving(true);

    try {
      const available = formData.available
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean);

      const [userRes, doctorRes] = await Promise.all([
        fetch(`${API_URL}/user/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: formData.name }),
        }),
        fetch(`${API_URL}/api/doctor/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            specialty: formData.specialty,
            experience: formData.experience,
            bio: formData.bio,
            available,
            address: {
              subCity: formData.subCity,
              city: formData.city,
              country: formData.country,
            },
          }),
        }),
      ]);

      if (!userRes.ok || !doctorRes.ok) {
        throw new Error("Failed to save doctor settings");
      }

      localStorage.setItem("userName", formData.name);
      toast.success("Doctor settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardHeader
        role="doctor"
        title="Settings"
        subtitle="Manage profile, expertise, and availability."
      />

        {loading ? (
          <p className="text-muted-foreground">Loading settings...</p>
        ) : (
          <div className="grid gap-6">
            <AnimatedCard hover={false}>
              <h3 className="font-semibold text-foreground mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-card"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-secondary/50 text-muted-foreground"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard hover={false}>
              <h3 className="font-semibold text-foreground mb-4">Professional Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Specialty</label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-card"
                      value={formData.specialty}
                      onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Experience</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.experience}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g. 7 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Available Slots (comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.available}
                    onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.value }))}
                    placeholder="09:00, 10:00, 15:00"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Sub City</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                      value={formData.subCity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subCity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <div className="flex gap-4">
              <GradientButton variant="primary" onClick={saveSettings} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </GradientButton>
              <GradientButton variant="outline" onClick={() => navigate("/dashboard/doctor")}>Cancel</GradientButton>
            </div>
          </div>
        )}
    </>
  );
};

export default DoctorSettings;
