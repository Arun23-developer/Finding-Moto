import { emitToUser } from './socket';
import type { ReturnRequestStatus } from '../models/ReturnRequest';

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
}
