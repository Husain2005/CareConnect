import { Link, useLocation, useNavigate } from "react-router-dom";
import { GradientButton } from "../ui/GradientButton";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    setIsLoggedIn(!!token);
    setUserRole(role || "");
    setUserName(name || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center text-xs font-bold">
              C
            </div>
            <span className="font-semibold text-sm text-foreground">
              CareConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm transition-colors ${
                  location.pathname === item.path
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to={userRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"}>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{userName}</span>
                  </div>
                </Link>
                <GradientButton className="flex items-center gap-2 px-3 py-1.5" variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="text-sm">Logout</span>
                </GradientButton>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <GradientButton variant="outline" size="sm">
                    Login
                  </GradientButton>
                </Link>
                <Link to="/auth?mode=signup">
                  <GradientButton variant="primary" size="sm">
                    Get Started
                  </GradientButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="font-medium text-muted-foreground hover:text-foreground py-2"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex gap-3 pt-4">
                {isLoggedIn ? (
                  <>
                    <Link 
                      to={userRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"} 
                      className="flex-1"
                    >
                      <GradientButton variant="outline" size="sm" className="w-full">
                        Dashboard
                      </GradientButton>
                    </Link>
                    <GradientButton 
                      variant="primary" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleLogout}
                    >
                      Logout
                    </GradientButton>
                  </>
                ) : (
                  <>
                    <Link to="/auth?mode=login" className="flex-1">
                      <GradientButton variant="outline" size="sm" className="w-full">
                        Login
                      </GradientButton>
                    </Link>
                    <Link to="/auth?mode=signup" className="flex-1">
                      <GradientButton variant="primary" size="sm" className="w-full">
                        Get Started
                      </GradientButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
