import { emitToUser } from './socket';
import { getOrderStatusLabel, type OrderStatus } from './orderStatus';
import { getServiceOrderStatusLabel, isServiceOrderStatus } from './serviceOrderStatus';
import { createNotification } from './notifications';
import type { NotificationRole } from '../models/Notification';

type WorkflowAudience = 'buyer' | 'seller' | 'delivery_agent';

interface OrderWorkflowEventInput {
  userId?: string | null;
  audience: WorkflowAudience;
  orderId: string;
  status: string;
  title: string;
  message: string;
  actorRole: 'buyer' | 'seller' | 'mechanic' | 'delivery_agent' | 'system';
}

const getWorkflowStatusLabel = (status: string) => {
  if (isServiceOrderStatus(status)) {
    return getServiceOrderStatusLabel(status);
  }

  const orderStatus = status as OrderStatus;
  return getOrderStatusLabel(orderStatus);
};

const toNotificationCategory = (
  audience: WorkflowAudience,
  status: string
): 'ORDER' | 'SERVICE_REQUEST' | 'DELIVERY_ASSIGNMENT' | 'PICKUP_REQUEST' => {
  if (audience === 'delivery_agent') {
    return status.includes('pickup') || status === 'ASSIGNED' ? 'PICKUP_REQUEST' : 'DELIVERY_ASSIGNMENT';
  }

  if (isServiceOrderStatus(status)) return 'SERVICE_REQUEST';
  return 'ORDER';
};

const getNotificationLink = (audience: WorkflowAudience, status: string) => {
  if (audience === 'buyer') return '/my-orders';
  if (audience === 'delivery_agent') return '/delivery/assigned';
  if (isServiceOrderStatus(status)) return '/mechanic/orders';
  return '/seller/orders';
};

const getNotificationRole = (audience: WorkflowAudience, status: string): NotificationRole => {
  if (isServiceOrderStatus(status) && audience === 'seller') return 'mechanic';
  return audience;
};

export function emitOrderWorkflowEvent({
  userId,
  audience,
  orderId,
  status,
  title,
  message,
  actorRole,
}: OrderWorkflowEventInput) {
  if (!userId) return;
  const statusLabel = getWorkflowStatusLabel(status);

  emitToUser(userId, 'order:workflow', {
    type: 'order_workflow',
    audience,
    orderId,
    status,
    statusLabel,
    title,
    message,
    actorRole,
    timestamp: new Date().toISOString(),
  });

  void createNotification({
    recipient: userId,
    role: getNotificationRole(audience, status),
    category: toNotificationCategory(audience, status),
    title,
    message,
    link: getNotificationLink(audience, status),
    metadata: {
      source: 'order_workflow',
      orderId,
      status,
      statusLabel,
      actorRole,
    },
  });
}
