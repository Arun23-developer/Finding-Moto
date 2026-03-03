import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  UserCircle,
  Bot,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Wrench,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/mechanic/dashboard" },
  { title: "Services", icon: Wrench, path: "/mechanic/services" },
  { title: "Products", icon: Package, path: "/mechanic/products" },
  { title: "Orders", icon: ShoppingCart, path: "/mechanic/orders" },
  { title: "Reviews", icon: Star, path: "/mechanic/reviews" },
  { title: "Profile", icon: UserCircle, path: "/mechanic/profile" },
  { title: "AI Assistant", icon: Bot, path: "/mechanic/ai-chat" },
  { title: "Notifications", icon: Bell, path: "/mechanic/notifications" },
];

interface MechanicLayoutProps {
  children: React.ReactNode;
}

export function MechanicLayout({ children }: MechanicLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (): string => {
    if (!user) return "M";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const currentPage = navItems.find((i) => i.path === location.pathname)?.title || "Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "sidebar-gradient flex flex-col border-r border-sidebar-border transition-all duration-300 z-50",
          "fixed lg:sticky top-0 h-screen",
          collapsed ? "lg:w-[70px]" : "lg:w-[260px]",
          mobileOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-600 shadow-lg shadow-amber-600/30">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
                  Finding Moto
                </h1>
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
                  Mechanic Panel
                </p>
              </div>
            )}
          </div>
          {/* Mobile close */}
          <button
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mechanic Info */}
        {(!collapsed || mobileOpen) && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-500/30">
                <span className="text-sm font-bold text-amber-400">{getInitials()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sidebar-primary-foreground truncate">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {(user as any)?.workshopName || (user as any)?.specialization || "Mechanic"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-2 py-3 space-y-1 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Back to Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              to="/mechanic/notifications"
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600">{getInitials()}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Mechanic</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-card shadow-lg py-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium">
                        {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      to="/mechanic/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <UserCircle className="h-4 w-4" /> Workshop Profile
                    </Link>
                    <Link
                      to="/mechanic/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <Bell className="h-4 w-4" /> Notifications
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">🔒</span> Change Password
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
