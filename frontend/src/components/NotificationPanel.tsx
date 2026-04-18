import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
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

interface NotificationPanelProps {
  userRole: "seller" | "mechanic" | "admin" | "delivery_agent";
  panelOpen: boolean;
  onPanelClose: () => void;
}

export function NotificationPanel({
  userRole,
  panelOpen,
  onPanelClose,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // TODO: Fetch notifications from backend based on user role and alert types
    // Alert types: Admin Alerts, Low Stock Alerts (below 10), Policy Updates, Customer Report Alerts
    const mockAlerts: Notification[] = [];

    // Admin Alerts
    if (
      userRole === "admin" ||
      userRole === "seller" ||
      userRole === "mechanic" ||
      userRole === "delivery_agent"
    ) {
      mockAlerts.push({
        id: 1,
        type: "admin_alert",
        title: "Admin Alert",
        message: "New user registration pending verification",
        time: "5 min ago",
        read: false,
        severity: "warning",
      });
    }

    // Low Stock Alerts (stock below 10)
    if (userRole === "seller" || userRole === "mechanic") {
      mockAlerts.push({
        id: 2,
        type: "low_stock",
        title: "Low Stock Alert",
        message: "Brake Pads (SKU: BP-001) stock is 7 units - below threshold of 10",
        time: "12 min ago",
        read: false,
        severity: "critical",
      });
      mockAlerts.push({
        id: 3,
        type: "low_stock",
        title: "Low Stock Alert",
        message: "Oil Filter (SKU: OF-002) stock is 9 units - below threshold of 10",
        time: "28 min ago",
        read: false,
        severity: "critical",
      });
    }

    // Policy Updates
    mockAlerts.push({
      id: 4,
      type: "policy_update",
      title: "Policy Update",
      message: "New refund policy effective from April 1st. Please review the updates.",
      time: "2 hours ago",
      read: false,
      severity: "info",
    });

    // Customer Report Alerts
    if (userRole === "seller" || userRole === "mechanic" || userRole === "admin") {
      mockAlerts.push({
        id: 5,
        type: "customer_report",
        title: "Customer Report Alert",
        message: "New customer complaint reported for order #FM-2045 - Quality issue",
        time: "3 hours ago",
        read: true,
        severity: "warning",
      });
    }

    setNotifications(mockAlerts);
  }, [userRole]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const markAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: Notification["type"]) => {
    const icons = {
      admin_alert: "⚠️",
      low_stock: "📉",
      policy_update: "📋",
      customer_report: "📢",
    };
    return icons[type];
  };

  const getSeverityColor = (severity: Notification["severity"]) => {
    const colors = {
      critical: "border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20",
      warning: "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20",
      info: "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20",
    };
    return colors[severity || "info"];
  };

  const notificationRoute =
    userRole === "delivery_agent"
      ? "/delivery/notifications"
      : `/${userRole}/notifications`;

  if (!panelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onPanelClose}
      />

      {/* Notification Panel */}
      <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-card shadow-xl max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold text-foreground">Alerts</h3>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4 py-8 text-center">
            <div className="space-y-2">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">No alerts yet</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
                  getSeverityColor(notif.severity),
                  !notif.read && "bg-opacity-60"
                )}
              >
                <div className="flex gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {getTypeIcon(notif.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn("text-sm font-medium", !notif.read && "font-semibold")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className={cn(
                          "h-2 w-2 rounded-full flex-shrink-0 mt-1",
                          notif.severity === "critical" ? "bg-red-500" : 
                          notif.severity === "warning" ? "bg-amber-500" : 
                          "bg-blue-500"
                        )} />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                      <div className="flex items-center gap-1">
                        {!notif.read && (
                          <button
                            onClick={(e) => markAsRead(notif.id, e)}
                            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => deleteNotification(notif.id, e)}
                          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <Link
            to={notificationRoute}
            onClick={onPanelClose}
            className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all alerts
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </>
  );
}
