import { emitToUser } from './socket';
import { getOrderStatusLabel, type OrderStatus } from './orderStatus';

type WorkflowAudience = 'buyer' | 'seller' | 'delivery_agent';

interface OrderWorkflowEventInput {
  userId?: string | null;
  audience: WorkflowAudience;
  orderId: string;
  status: OrderStatus;
  title: string;
  message: string;
  actorRole: 'buyer' | 'seller' | 'delivery_agent' | 'system';
}

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
    statusLabel: getOrderStatusLabel(status),
    title,
    message,
    actorRole,
    timestamp: new Date().toISOString(),
  });
}
