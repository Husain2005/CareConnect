import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Stethoscope, UserCircle, ArrowLeft, Eye, EyeOff, Phone } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "signup";
type UserRole = "patient" | "doctor";

const API_URL = import.meta.env.VITE_API_URL || "";

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return { message: "Unexpected server response" };
  }
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>((searchParams.get("mode") as AuthMode) || "login");
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    if (token) {
      navigate(userRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
    }
  }, [navigate]);

  useEffect(() => {
    const urlMode = searchParams.get("mode") as AuthMode;
    const urlRole = searchParams.get("role") as UserRole;
    if (urlMode) setMode(urlMode);
    if (urlRole) setRole(urlRole);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const response = await fetch(`${API_URL}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await safeJson(response);

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("userId", data.user.id);
          toast.success("Welcome back!");
          navigate(data.user.role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient");
        } else {
          toast.error(data.message || "Login failed");
        }
      } else if (mode === "signup") {
        const response = await fetch(`${API_URL}/user/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role,
            phone: role === "doctor" ? formData.phone : "",
          }),
        });

        const data = await safeJson(response);

        if (response.ok) {
          toast.success("Account created successfully!");
          setMode("login");
        } else {
          toast.error(data.message || "Signup failed");
        }
      }
    } catch {
      toast.error("Network error. Start backend on :5000 and check VITE_API_URL/proxy.");
    }

    setIsLoading(false);
  };

  

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === "login" ? "Sign in to continue" : "Join CareConnect in seconds"}
          </p>

          <div className="flex gap-2 mb-6">
            {[
              { value: "patient", label: "Patient", icon: UserCircle },
              { value: "doctor", label: "Doctor", icon: Stethoscope },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value as UserRole)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium ${
                  role === value ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 pl-10 pr-3 border border-border rounded-xl"
                      required
                    />
                  </div>
                </div>

                {role === "doctor" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl"
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 pl-10 pr-3 border border-border rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 pl-10 pr-10 border border-border rounded-xl"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-foreground text-background font-medium disabled:opacity-50">
              {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setFormData({ name: "", email: "", password: "", phone: "" });
              }}
              className="text-foreground font-medium hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
