import {
  Bell,
  House,
  MessageSquare,
  Package,
  RotateCcw,
  ShoppingCart,
  User,
  UserCircle,
} from "lucide-react";
import { DashboardShell } from "./DashboardShell";

const navItems = [
  { title: "Home / Explore", icon: House, path: "/dashboard" },
  { title: "Cart", icon: Package, path: "/buyer/cart" },
  { title: "My Orders", icon: ShoppingCart, path: "/my-orders" },
  { title: "Return & Claims", icon: RotateCcw, path: "/buyer/returns-claims" },
  { title: "Chat", icon: MessageSquare, path: "/chat" },
  { title: "Notifications", icon: Bell, path: "/buyer/notifications" },
  {
    title: "Account",
    icon: UserCircle,
    path: "/buyer/account",
    isActive: (pathname) => pathname === "/buyer/account",
    children: [
      {
        title: "Profile",
        icon: UserCircle,
        path: "/buyer/account?tab=profile",
        isActive: (pathname, search) =>
          pathname === "/buyer/account" && new URLSearchParams(search).get("tab") === "profile",
      },
      {
        title: "Settings",
        icon: UserCircle,
        path: "/buyer/account?tab=settings",
        isActive: (pathname, search) =>
          pathname === "/buyer/account" && new URLSearchParams(search).get("tab") === "settings",
      },
    ],
  },
];

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  return (
    <DashboardShell
      navItems={navItems}
      panelLabel="Buyer Dashboard"
      roleLabel="Buyer"
      roleIcon={User}
      avatarFallback="B"
      profilePath="/buyer/account"
      profileLabel="Account"
      profileSubtitle="Buyer account"
      aiPath="/ai-chat"
      notificationRole="buyer"
    >
      {children}
    </DashboardShell>
  );
}
