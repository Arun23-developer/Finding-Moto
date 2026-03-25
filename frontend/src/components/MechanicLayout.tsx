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
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl } from "@/lib/imageUrl";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/mechanic/dashboard" },
  { title: "Services", icon: Wrench, path: "/mechanic/services" },
  { title: "Products", icon: Package, path: "/mechanic/products" },
  { title: "Orders", icon: ShoppingCart, path: "/mechanic/orders" },
  { title: "Reviews", icon: Star, path: "/mechanic/reviews" },
  { title: "Chat", icon: MessageSquare, path: "/mechanic/chat" },
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
    <div className="flex min-h-screen w-full" style={{ background: '#D3D3D3' }}>
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
          "flex flex-col border-r border-[#2D3A42] transition-all duration-300 z-50",
          "fixed top-0 h-screen",
          collapsed ? "lg:w-[70px]" : "lg:w-[260px]",
          mobileOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:translate-x-0"
        )}
        style={{ background: 'linear-gradient(180deg, #36454F 0%, #2D3A42 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-4 h-16 border-b border-[#2D3A42]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 shadow-lg shadow-blue-500/30">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Finding Moto
                </h1>
                <p className="text-[10px] text-[#8A9BAA] uppercase tracking-widest">
                  Mechanic Panel
                </p>
              </div>
            )}
          </div>
          {/* Mobile close */}
          <button
            className="lg:hidden text-[#8A9BAA] hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mechanic Info */}
        {(!collapsed || mobileOpen) && (
          <div className="px-4 py-3 border-b border-[#2D3A42]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30">
                {user?.avatar ? (
                  <img src={resolveMediaUrl(user.avatar, "https://placehold.co/80x80?text=M")} alt="Mechanic avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-blue-400">{getInitials()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-[#8A9BAA] truncate">
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
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                      : "text-[#8A9BAA] hover:bg-[#2D3A42] hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(!collapsed || mobileOpen) && <span>{item.title}</span>}
                </Link>
                {collapsed && !mobileOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-[#1F2937] text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[999] pointer-events-none">
                    {item.title}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1F2937]" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-2 py-3 space-y-1 border-t border-[#2D3A42]">
          <div className="relative group">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8A9BAA] hover:bg-[#2D3A42] hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>Back to Site</span>}
            </Link>
            {collapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-[#1F2937] text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[999] pointer-events-none">
                Back to Site
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1F2937]" />
              </div>
            )}
          </div>
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || mobileOpen) && <span>Logout</span>}
            </button>
            {collapsed && !mobileOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-md bg-[#1F2937] text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[999] pointer-events-none">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#1F2937]" />
              </div>
            )}
          </div>
          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-[#8A9BAA] hover:bg-[#2D3A42] hover:text-white transition-colors"
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
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-[#BEBEBE] backdrop-blur-xl" style={{ background: 'rgba(224,224,224,0.9)' }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#C0C0C0] transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5 text-[#374151]" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-[#1F2937]">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              to="/mechanic/notifications"
              className="relative p-2 rounded-lg hover:bg-[#C0C0C0] transition-colors"
            >
              <Bell className="h-5 w-5 text-[#374151]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#C0C0C0] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={resolveMediaUrl(user.avatar, "https://placehold.co/80x80?text=M")} alt="Mechanic avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-blue-600">{getInitials()}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none text-[#1F2937]">
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </p>
                  <p className="text-xs text-[#6B7280]">Mechanic</p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#6B7280] hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[#BEBEBE] bg-white shadow-lg py-2">
                    <div className="px-3 py-2 border-b border-[#E5E7EB]">
                      <p className="text-sm font-medium text-[#1F2937]">
                        {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                      </p>
                      <p className="text-xs text-[#6B7280]">{user?.email}</p>
                    </div>
                    <Link
                      to="/mechanic/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                    >
                      <UserCircle className="h-4 w-4" /> Workshop Profile
                    </Link>
                    <Link
                      to="/mechanic/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                    >
                      <Bell className="h-4 w-4" /> Notifications
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                    >
                      <span className="text-sm">🔒</span> Change Password
                    </Link>
                    <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
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
        onClick={() => navigate('/mechanic/ai-chat')}
        title="AI Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(79,70,229,0.45)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(79,70,229,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)'; }}
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
