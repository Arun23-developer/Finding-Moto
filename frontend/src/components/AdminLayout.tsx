import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Wrench,
  Bell,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Sellers", icon: Store, path: "/admin/users?tab=seller", basePath: "/admin/users", tab: "seller" },
  { title: "Mechanics", icon: Wrench, path: "/admin/users?tab=mechanic", basePath: "/admin/users", tab: "mechanic" },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "Contacts", icon: Mail, path: "/admin/contacts" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentTab = new URLSearchParams(location.search).get("tab");

  const isItemActive = (item: typeof navItems[number]) => {
    if (item.basePath) {
      return location.pathname === item.basePath && currentTab === item.tab;
    }
    return location.pathname === item.path;
  };

  const activeTitle =
    navItems.find((item) => isItemActive(item))?.title ||
    (location.pathname === "/admin/users" ? "Users" : "Dashboard");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (): string => {
    if (!user) return "A";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "sidebar-gradient fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary glow-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Finding Moto
              </h1>
              <p className="text-[10px] text-sidebar-foreground uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md glow-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-2 py-3 space-y-1 border-t border-sidebar-border">
          {/* Back to Site */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Back to Site</span>}
          </Link>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex min-h-screen flex-1 min-w-0 flex-col", collapsed ? "ml-[70px]" : "ml-[260px]")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 border-b border-border bg-background/95 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-semibold">{activeTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{getInitials()}</span>
              </div>
              {user && (
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
