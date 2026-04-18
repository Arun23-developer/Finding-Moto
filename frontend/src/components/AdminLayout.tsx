import {
  Bell,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { DashboardShell } from "./DashboardShell";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  {
    title: "Sellers",
    icon: Store,
    path: "/admin/users?tab=seller",
    isActive: (pathname, search) => pathname === "/admin/users" && new URLSearchParams(search).get("tab") === "seller",
  },
  {
    title: "Mechanics",
    icon: Wrench,
    path: "/admin/users?tab=mechanic",
    isActive: (pathname, search) => pathname === "/admin/users" && new URLSearchParams(search).get("tab") === "mechanic",
  },
  {
    title: "Delivery Agents",
    icon: Truck,
    path: "/admin/users?tab=delivery_agent",
    isActive: (pathname, search) =>
      pathname === "/admin/users" && new URLSearchParams(search).get("tab") === "delivery_agent",
  },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "Contacts", icon: Mail, path: "/admin/contacts" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardShell
      navItems={navItems}
      panelLabel="Admin Panel"
      roleLabel="Administrator"
      roleIcon={Shield}
      avatarFallback="A"
      profileSubtitle="System administrator"
      notificationRole="admin"
    >
      {children}
    </DashboardShell>
  );
}
