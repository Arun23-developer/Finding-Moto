import { Bell, Check, Clock3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOrderWorkflowNotifications,
  type WorkflowNotification,
} from "@/context/OrderWorkflowNotificationsContext";

interface WorkflowNotificationsViewProps {
  compact?: boolean;
}

const statusTone: Record<string, string> = {
  awaiting_seller_confirmation: "border-amber-500 bg-amber-50/70",
  confirmed: "border-blue-500 bg-blue-50/70",
  ready_for_dispatch: "border-sky-500 bg-sky-50/70",
  pickup_assigned: "border-cyan-500 bg-cyan-50/70",
  picked_up: "border-indigo-500 bg-indigo-50/70",
  out_for_delivery: "border-violet-500 bg-violet-50/70",
  delivered: "border-emerald-500 bg-emerald-50/70",
  delivery_failed: "border-red-500 bg-red-50/70",
  cancelled: "border-red-500 bg-red-50/70",
  completed: "border-emerald-500 bg-emerald-50/70",
};

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";

  const elapsedMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(elapsedMs / 60000));

  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: WorkflowNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-l-4 px-4 py-3 transition-colors hover:bg-muted/20",
        statusTone[notification.status] || "border-slate-400 bg-slate-50/70",
        !notification.read && "shadow-sm"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cn("text-sm font-medium text-foreground", !notification.read && "font-semibold")}>
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
            </div>
            {!notification.read ? <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" /> : null}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Order #{notification.orderId.slice(-6).toUpperCase()}</span>
            <span>{notification.statusLabel}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {formatRelativeTime(notification.timestamp)}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-1">
          {!notification.read ? (
            <button
              onClick={() => onRead(notification.id)}
              className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          ) : null}
          <button
            onClick={() => onDelete(notification.id)}
            className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-100"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowNotificationsView({ compact = false }: WorkflowNotificationsViewProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    removeNotification,
    clearNotifications,
  } = useOrderWorkflowNotifications();

  const visibleNotifications = compact ? notifications.slice(0, 5) : notifications;

  return (
    <div className="space-y-4">
      {!compact ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread workflow updates` : "All caught up"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Check className="h-4 w-4" />
                Mark All Read
              </button>
            ) : null}
            {notifications.length > 0 ? (
              <button
                onClick={clearNotifications}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {visibleNotifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-medium text-foreground">No workflow notifications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New order status updates will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              onDelete={removeNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
