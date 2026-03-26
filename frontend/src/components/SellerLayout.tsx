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
  Store,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl } from "@/lib/imageUrl";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/seller/dashboard" },
  { title: "Products", icon: Package, path: "/seller/products" },
  { title: "Orders", icon: ShoppingCart, path: "/seller/orders" },
  { title: "Reviews", icon: Star, path: "/seller/reviews" },
  { title: "Chat", icon: MessageSquare, path: "/seller/chat" },
  { title: "Profile", icon: UserCircle, path: "/seller/profile" },
  { title: "AI Assistant", icon: Bot, path: "/seller/ai-chat" },
  { title: "Notifications", icon: Bell, path: "/seller/notifications" },
];

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
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
    if (!user) return "S";
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
          "flex flex-col border-r border-indigo-700/30 transition-all duration-300 z-50",
          "fixed top-0 h-screen",
          collapsed ? "lg:w-[70px]" : "lg:w-[260px]",
          mobileOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:translate-x-0"
        )}
        style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2744 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-4 h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/40">
              <Store className="h-5 w-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Finding Moto
                </h1>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
                  Seller Panel
                </p>
              </div>
            )}
          </div>
          {/* Mobile close */}
          <button
            className="lg:hidden text-blue-200 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Seller Info */}
        {(!collapsed || mobileOpen) && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white/20 shadow-md">
                {user?.avatar ? (
                  <img src={resolveMediaUrl(user.avatar, "https://placehold.co/80x80?text=S")} alt="Seller avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{getInitials()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {user?.shopName || "My Shop"}
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
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/40"
                      : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed || mobileOpen) && <span>{item.title}</span>}
                </Link>
                {collapsed && !mobileOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-indigo-900 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[999] pointer-events-none">
                    {item.title}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-indigo-900" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-2 py-3 space-y-1 border-t border-white/10">
          <div className="relative group">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>Back to Site</span>}
            </Link>
            {collapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-indigo-900 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[999] pointer-events-none">
                Back to Site
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-indigo-900" />
              </div>
            )}
          </div>
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>Logout</span>}
            </button>
            {collapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-indigo-900 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[999] pointer-events-none">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-indigo-900" />
              </div>
            )}
          </div>
          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-blue-200/70 hover:bg-white/10 hover:text-white transition-colors"
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
      <div className={cn("flex min-h-screen flex-1 min-w-0 flex-col", collapsed ? "lg:ml-[70px]" : "lg:ml-[260px]")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              to="/seller/notifications"
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={resolveMediaUrl(user.avatar, "https://placehold.co/80x80?text=S")} alt="Seller avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{getInitials()}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Seller</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-card shadow-lg py-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      to="/seller/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <UserCircle className="h-4 w-4" /> Shop Profile
                    </Link>
                    <Link
                      to="/seller/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Bell className="h-4 w-4" /> Notifications
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">🔒</span> Change Password
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-colors"
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

      {/* AI Floating Button */}
      <button
        onClick={() => navigate('/seller/ai-chat')}
        title="AI Assistant"
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer border-none"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8"/>
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <path d="M8 12h.01"/><path d="M16 12h.01"/>
          <path d="M9 17c1.2.8 2.4 1 3 1s1.8-.2 3-1"/>
        </svg>
      </button>
    </div>
  );
}
