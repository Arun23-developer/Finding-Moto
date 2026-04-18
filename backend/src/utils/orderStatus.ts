export const ORDER_STATUSES = [
  'pending',
  'awaiting_seller_confirmation',
  'confirmed',
  'rejected',
  'processing',
  'ready_for_dispatch',
  'pickup_assigned',
  'picked_up',
  'out_for_delivery',
  'delivery_failed',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
  'shipped',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  awaiting_seller_confirmation: 'Placed',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  processing: 'Processing',
  ready_for_dispatch: 'Package Ready',
  pickup_assigned: 'Delivery Agent Assigned',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivery_failed: 'Delivery Failed',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  shipped: 'Out for Delivery',
};

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ['awaiting_seller_confirmation', 'cancelled'],
  awaiting_seller_confirmation: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['processing', 'ready_for_dispatch', 'cancelled'],
  rejected: ['refunded'],
  processing: ['ready_for_dispatch', 'cancelled'],
  ready_for_dispatch: ['pickup_assigned', 'cancelled'],
  pickup_assigned: ['picked_up'],
  picked_up: ['out_for_delivery'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivery_failed: [],
  delivered: ['completed'],
  completed: ['refunded'],
  cancelled: ['refunded'],
  refunded: [],
  shipped: ['delivered'],
};

const LEGACY_STATUS_MAP: Partial<Record<string, OrderStatus>> = {
  shipped: 'out_for_delivery',
};

export const normalizeOrderStatus = (status?: string | null): OrderStatus => {
  if (!status) return 'pending';

  const normalized = status.toLowerCase();
  if ((ORDER_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as OrderStatus;
  }

  return LEGACY_STATUS_MAP[normalized] ?? 'pending';
};

export const getOrderStatusLabel = (status?: string | null): string => {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUS_LABELS[normalized] ?? normalized;
};

export const isTerminalOrderStatus = (status?: string | null): boolean => {
  const normalized = normalizeOrderStatus(status);
  return ['rejected', 'delivery_failed', 'completed', 'cancelled', 'refunded'].includes(normalized);
};
