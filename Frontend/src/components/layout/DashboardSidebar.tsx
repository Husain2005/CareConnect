import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, User, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ComponentType } from "react";

type SidebarItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  route: string;
};

type DashboardSidebarProps = {
  items: SidebarItem[];
  activePath: string;
  collapsed: boolean;
  onToggle: () => void;
};

export const DashboardSidebar = ({ items, activePath, collapsed, onToggle }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "member";

  return (
    <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-200 ${collapsed ? "w-24" : "w-64"}`}>
      <button
        onClick={onToggle}
        className="absolute -right-3 top-5 w-7 h-7 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center z-50"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
      </button>
      <div className="h-full flex flex-col p-3 md:p-4">
      <div className="flex items-center justify-between mb-6">
      <Link to="/" className="flex items-center gap-2 min-w-0">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className={`${collapsed ? "hidden" : "inline"} font-display font-bold text-lg truncate`}>
          Care<span className="text-primary">Connect</span>
        </span>
      </Link>

      <div className="w-9 h-9" />
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto">
        {items.map(({ icon: Icon, label, route }) => {
          const isActive = activePath === route || (route !== "/dashboard/patient" && activePath.startsWith(route));
          return (
            <button
              key={label}
              onClick={() => navigate(route)}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-3 px-2 md:px-4 py-3 rounded-xl ${
                isActive
                  ? "gradient-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
              <span className={`${collapsed ? "hidden" : "inline"}`}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-3 border border-border rounded-xl bg-secondary/50 p-2 md:p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 md:gap-3"}`}>
          {!collapsed && (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-card border border-border flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userRole");
              localStorage.removeItem("userName");
              localStorage.removeItem("userId");
              navigate("/");
            }}
            className={`p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-destructive ${
              collapsed ? "w-9 h-9 flex items-center justify-center" : ""
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </aside>
  );
};
