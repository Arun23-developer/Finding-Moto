import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Wrench,
  Star,
  Package,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: "service" | "review" | "parts" | "system" | "schedule";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  service: { icon: Wrench, color: "text-amber-600", bg: "bg-amber-600/10" },
  review: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-600/10" },
  parts: { icon: Package, color: "text-blue-600", bg: "bg-blue-600/10" },
  system: { icon: Settings, color: "text-purple-600", bg: "bg-purple-600/10" },
  schedule: { icon: Clock, color: "text-emerald-600", bg: "bg-emerald-600/10" },
};

type FilterType = "all" | "service" | "review" | "parts" | "system" | "schedule";

// ─── Notifications Page ─────────────────────────────────────────────────────
export default function MechanicNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => filter === "all" || n.type === filter);

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

  const filterCounts: Record<FilterType, number> = {
    all: notifications.length,
    service: notifications.filter((n) => n.type === "service").length,
    review: notifications.filter((n) => n.type === "review").length,
    parts: notifications.filter((n) => n.type === "parts").length,
    system: notifications.filter((n) => n.type === "system").length,
    schedule: notifications.filter((n) => n.type === "schedule").length,
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["service", "review", "parts", "system", "schedule"] as const).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const unread = notifications.filter((n) => n.type === type && !n.read).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? "all" : type)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all",
                filter === type ? "ring-2 ring-amber-500 border-amber-500" : "hover:border-amber-300"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-xs text-muted-foreground capitalize">{type === "parts" ? "Parts" : type + "s"}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">{filterCounts[type]}</p>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                    {unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "service", "review", "parts", "system", "schedule"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f
                ? "bg-amber-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f === "all" ? `All (${filterCounts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)}${f !== "parts" ? "s" : ""} (${filterCounts[f]})`}
          </button>
        ))}
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
                      "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/20",
                      idx < filtered.length - 1 && "border-b border-border/50",
                      !notification.read && "bg-amber-50/50 dark:bg-amber-950/10"
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
                              <CheckCircle className="h-4 w-4" />
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
