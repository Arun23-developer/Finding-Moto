import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  FileText,
  MessageSquare,
  Clock,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: "admin_alert" | "low_stock" | "policy_update" | "customer_report";
  title: string;
  message: string;
  time: string;
  read: boolean;
  severity?: "critical" | "warning" | "info";
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  admin_alert: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-600/10", label: "Admin Alerts" },
  low_stock: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-600/10", label: "Low Stock" },
  policy_update: { icon: FileText, color: "text-blue-600", bg: "bg-blue-600/10", label: "Policy Updates" },
  customer_report: { icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-600/10", label: "Customer Reports" },
};

type FilterType = "all" | "admin_alert" | "low_stock" | "policy_update" | "customer_report";

// ─── Notifications Page ─────────────────────────────────────────────────────
export default function MechanicNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "admin_alert",
      title: "Admin Alert",
      message: "New policy announcement regarding mechanic accounts",
      time: "5 min ago",
      read: false,
      severity: "warning",
    },
    {
      id: 2,
      type: "low_stock",
      title: "Low Stock Alert",
      message: "Socket Set (SKU: SS-001) stock is 5 units - below threshold of 10",
      time: "12 min ago",
      read: false,
      severity: "critical",
    },
    {
      id: 3,
      type: "low_stock",
      title: "Low Stock Alert",
      message: "Wrench Set (SKU: WS-002) stock is 8 units - below threshold of 10",
      time: "28 min ago",
      read: false,
      severity: "critical",
    },
    {
      id: 4,
      type: "policy_update",
      title: "Policy Update",
      message: "New warranty policy effective from April 1st. Please review the updates.",
      time: "2 hours ago",
      read: false,
      severity: "info",
    },
    {
      id: 5,
      type: "customer_report",
      title: "Customer Report Alert",
      message: "New customer complaint reported for service #SVC-2045",
      time: "3 hours ago",
      read: true,
      severity: "warning",
    },
  ]);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => filter === "all" || n.type === filter);

  const filterCounts: Record<FilterType, number> = {
    all: notifications.length,
    admin_alert: notifications.filter((n) => n.type === "admin_alert").length,
    low_stock: notifications.filter((n) => n.type === "low_stock").length,
    policy_update: notifications.filter((n) => n.type === "policy_update").length,
    customer_report: notifications.filter((n) => n.type === "customer_report").length,
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Check className="h-4 w-4" /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "admin_alert", "low_stock", "policy_update", "customer_report"] as const).map((f) => {
          const config = f === "all" ? null : typeConfig[f];
          const Icon = config?.icon;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                filter === f
                  ? "bg-amber-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {f === "all" ? "All" : config?.label} ({filterCounts[f]})
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div>
              {filtered.map((notification, idx) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/20 border-l-4",
                      idx < filtered.length - 1 && "border-b border-border/50",
                      notification.severity === "critical" && "border-l-red-500 bg-red-50/30 dark:bg-red-950/10",
                      notification.severity === "warning" && "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10",
                      notification.severity === "info" && "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10",
                      !notification.read && "font-semibold"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn("text-sm font-semibold", !notification.read && "text-amber-600")}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/30 text-amber-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
