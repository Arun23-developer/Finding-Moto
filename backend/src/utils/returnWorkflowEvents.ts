import { emitToUser } from './socket';
import type { ReturnRequestStatus } from '../models/ReturnRequest';
import { createNotification } from './notifications';

type ReturnWorkflowAudience = 'buyer' | 'seller' | 'mechanic' | 'delivery_agent';

interface ReturnWorkflowEventInput {
  userId?: string | null;
  audience: ReturnWorkflowAudience;
  returnRequestId: string;
  orderId: string;
  status: ReturnRequestStatus;
  title: string;
  message: string;
  actorRole: 'buyer' | 'seller' | 'mechanic' | 'delivery_agent' | 'system';
}

const toNotificationCategory = (status: ReturnRequestStatus): 'RETURN' | 'REFUND' | 'PICKUP_REQUEST' => {
  if (status === 'REFUND_INITIATED' || status === 'REFUND_COMPLETED') return 'REFUND';
  if (status === 'RETURN_PICKUP_ASSIGNED' || status === 'RETURN_PICKED_UP' || status === 'RETURN_DELIVERED') {
    return 'PICKUP_REQUEST';
  }
  return 'RETURN';
};

const getNotificationLink = (audience: ReturnWorkflowAudience) => {
  if (audience === 'buyer') return '/buyer/returns-claims';
  if (audience === 'delivery_agent') return '/delivery/assigned';
  if (audience === 'mechanic') return '/mechanic/returns-claims';
  return '/seller/returns-claims';
};

export function emitReturnWorkflowEvent({
  userId,
  audience,
  returnRequestId,
  orderId,
  status,
  title,
  message,
  actorRole,
}: ReturnWorkflowEventInput) {
  if (!userId) return;

  emitToUser(userId, 'return:workflow', {
    type: 'return_workflow',
    audience,
    returnRequestId,
    orderId,
    status,
    title,
    message,
    actorRole,
    timestamp: new Date().toISOString(),
  });

  void createNotification({
    recipient: userId,
    role: audience,
    category: toNotificationCategory(status),
    title,
    message,
    link: getNotificationLink(audience),
    metadata: {
      source: 'return_workflow',
      returnRequestId,
      orderId,
      status,
      actorRole,
    },
  });
}
