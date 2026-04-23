import { emitToUser } from './socket';
import { getOrderStatusLabel, type OrderStatus } from './orderStatus';
import { getServiceOrderStatusLabel, isServiceOrderStatus } from './serviceOrderStatus';

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

  emitToUser(userId, 'order:workflow', {
    type: 'order_workflow',
    audience,
    orderId,
    status,
    statusLabel: getWorkflowStatusLabel(status),
    title,
    message,
    actorRole,
    timestamp: new Date().toISOString(),
  });
}
