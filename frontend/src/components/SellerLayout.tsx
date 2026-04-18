import {
  Bell,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { DashboardShell } from "./DashboardShell";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/seller/dashboard" },
  { title: "Products (Add / Manage)", icon: Package, path: "/seller/products" },
  { title: "Orders", icon: ShoppingCart, path: "/seller/orders" },
  { title: "Shipping & Delivery", icon: Truck, path: "/seller/shipping-delivery" },
  { title: "Returns & Claims", icon: RotateCcw, path: "/seller/returns-claims" },
  { title: "Finance status", icon: Wallet, path: "/seller/finance-status" },
  { title: "Notification", icon: Bell, path: "/seller/notification" },
  { title: "Buyer message center", icon: MessageSquare, path: "/seller/buyer-message-center" },
  { title: "Support / Help Center", icon: LifeBuoy, path: "/seller/support-help-center" },
  { title: "Settings", icon: Settings, path: "/seller/settings" },
];

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <DashboardShell
      navItems={navItems}
      panelLabel="Seller Panel"
      roleLabel="Seller"
      roleIcon={Store}
      avatarFallback="S"
      profilePath="/seller/profile"
      profileLabel="Shop Profile"
      profileSubtitle="Seller account"
      aiPath="/seller/ai-chat"
      notificationRole="seller"
    >
      {children}
    </DashboardShell>
  );
}
