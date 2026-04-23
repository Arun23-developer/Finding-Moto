import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createAuthedSocket, type OrderWorkflowSocketEvent } from "@/lib/socket";
import { useAuth } from "./AuthContext";

export type WorkflowAudience = "buyer" | "seller" | "delivery_agent";

export interface WorkflowNotification extends OrderWorkflowSocketEvent {
  id: string;
  read: boolean;
}

interface OrderWorkflowNotificationsContextValue {
  notifications: WorkflowNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const STORAGE_KEY_PREFIX = "workflow_notifications";

const OrderWorkflowNotificationsContext =
  createContext<OrderWorkflowNotificationsContextValue | null>(null);

const toWorkflowAudience = (role?: string | null): WorkflowAudience | null => {
  if (role === "buyer" || role === "seller" || role === "delivery_agent") return role;
  if (role === "mechanic") return "seller";
  return null;
};

const getStorageKey = (userId?: string | null) =>
  userId ? `${STORAGE_KEY_PREFIX}:${userId}` : STORAGE_KEY_PREFIX;

export function OrderWorkflowNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const audience = toWorkflowAudience(user?.role);
  const storageKey = getStorageKey(user?._id);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);

  useEffect(() => {
    if (!user?._id || !audience) {
      setNotifications([]);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setNotifications([]);
        return;
      }

      const parsed = JSON.parse(saved);
      setNotifications(Array.isArray(parsed) ? parsed : []);
    } catch {
      setNotifications([]);
    }
  }, [audience, storageKey, user?._id]);

  useEffect(() => {
    if (!user?._id || !audience) return;
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [audience, notifications, storageKey, user?._id]);

  useEffect(() => {
    if (!user?._id || !audience) return;

    const socket = createAuthedSocket();
    if (!socket) return;

    const handleWorkflowEvent = (event: OrderWorkflowSocketEvent) => {
      if (event.audience !== audience) return;

      setNotifications((current) => {
        const nextNotification: WorkflowNotification = {
          ...event,
          id: `${event.orderId}:${event.status}:${event.timestamp}`,
          read: false,
        };

        const deduped = current.filter((item) => item.id !== nextNotification.id);
        return [nextNotification, ...deduped].slice(0, 50);
      });
    };

    socket.on("order:workflow", handleWorkflowEvent);

    return () => {
      socket.off("order:workflow", handleWorkflowEvent);
      socket.disconnect();
    };
  }, [audience, user?._id]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      markAsRead,
      markAllRead,
      removeNotification,
      clearNotifications,
    }),
    [clearNotifications, markAllRead, markAsRead, notifications, removeNotification]
  );

  return (
    <OrderWorkflowNotificationsContext.Provider value={value}>
      {children}
    </OrderWorkflowNotificationsContext.Provider>
  );
}

export function useOrderWorkflowNotifications() {
  const context = useContext(OrderWorkflowNotificationsContext);
  if (!context) {
    throw new Error("useOrderWorkflowNotifications must be used within OrderWorkflowNotificationsProvider");
  }
  return context;
}
