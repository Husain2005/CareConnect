import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  Calendar,
  Clock,
  Settings,
  Search,
  FileText,
  User,
  Phone,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

const PatientSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodType: "",
    allergies: "",
    emergencyContact: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login&role=patient");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to load profile");

        const data = await response.json();
        setFormData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          dateOfBirth: data.user?.dateOfBirth || "",
          bloodType: data.user?.bloodType || "",
          allergies: data.user?.allergies || "",
          emergencyContact: data.user?.emergencyContact || "",
        });
      } catch (error) {
        toast.error("Could not load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  const saveSettings = async () => {
    if (!token) return;
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          emergencyContact: formData.emergencyContact,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save profile");

      localStorage.setItem("userName", data.user?.name || formData.name);

      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
        <DashboardHeader
          role="patient"
          title="Settings"
          subtitle="Manage profile and health preferences."
        />

        {loading ? (
          <p className="text-muted-foreground">Loading settings...</p>
        ) : (
          <div className="grid gap-6">
            <AnimatedCard hover={false}>
              <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-card"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard hover={false}>
              <h3 className="font-semibold text-foreground mb-4">Health Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Blood Type</label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.bloodType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bloodType: e.target.value }))}
                  >
                    <option value="">Select blood type</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Allergies</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    rows={3}
                    value={formData.allergies}
                    onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                    placeholder="List any known allergies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Name and phone number"
                  />
                </div>
              </div>
            </AnimatedCard>

            <div className="flex gap-4">
              <GradientButton variant="primary" onClick={saveSettings} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </GradientButton>
              <GradientButton
                variant="outline"
                onClick={() => navigate("/dashboard/patient")}
              >
                Cancel
              </GradientButton>
            </div>
          </div>
        )}
    </>
  );
};

export default PatientSettings;
