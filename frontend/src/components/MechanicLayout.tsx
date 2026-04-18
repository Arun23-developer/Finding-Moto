import {
  Bell,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Truck,
  Wallet,
  Wrench,
} from "lucide-react";
import { DashboardShell } from "./DashboardShell";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/mechanic/dashboard" },
  { title: "Products (Add / Manage)", icon: Package, path: "/mechanic/products" },
  { title: "Services (Add / Manage)", icon: Wrench, path: "/mechanic/services" },
  { title: "Orders", icon: ShoppingCart, path: "/mechanic/orders" },
  { title: "Shipping & Delivery", icon: Truck, path: "/mechanic/shipping-delivery" },
  { title: "Returns & Claims", icon: RotateCcw, path: "/mechanic/returns-claims" },
  { title: "Finance status", icon: Wallet, path: "/mechanic/finance-status" },
  { title: "Notification", icon: Bell, path: "/mechanic/notification" },
  { title: "Buyer message center", icon: MessageSquare, path: "/mechanic/buyer-message-center" },
  { title: "Support / Help Center", icon: LifeBuoy, path: "/mechanic/support-help-center" },
  { title: "Settings", icon: Settings, path: "/mechanic/settings" },
];

interface MechanicLayoutProps {
  children: React.ReactNode;
}

export function MechanicLayout({ children }: MechanicLayoutProps) {
  return (
    <DashboardShell
      navItems={navItems}
      panelLabel="Mechanic Panel"
      roleLabel="Mechanic"
      roleIcon={Wrench}
      avatarFallback="M"
      profilePath="/mechanic/profile"
      profileLabel="Workshop Profile"
      profileSubtitle="Mechanic account"
      aiPath="/mechanic/ai-chat"
      notificationRole="mechanic"
    >
      {children}
    </DashboardShell>
  );
}
