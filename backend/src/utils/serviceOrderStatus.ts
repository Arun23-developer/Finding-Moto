export const SERVICE_ORDER_STATUSES = [
  'SERVICE_ORDER_PLACED',
  'SERVICE_ORDER_CONFIRMED',
  'SERVICE_ORDER_REJECTED',
  'BUYER_ARRIVED',
  'SERVICE_IN_PROGRESS',
  'SERVICE_COMPLETED',
  'PAYMENT_RECEIVED',
] as const;

export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  SERVICE_ORDER_PLACED: 'Placed',
  SERVICE_ORDER_CONFIRMED: 'Confirmed',
  SERVICE_ORDER_REJECTED: 'Rejected',
  BUYER_ARRIVED: 'Arrived',
  SERVICE_IN_PROGRESS: 'In Progress',
  SERVICE_COMPLETED: 'Completed',
  PAYMENT_RECEIVED: 'Payment Sent',
};

export const isServiceOrderStatus = (status?: string | null): boolean => {
  if (!status) return false;
  const normalized = status.toString().trim().toUpperCase();
  return (SERVICE_ORDER_STATUSES as readonly string[]).includes(normalized);
};

export const SERVICE_ORDER_STATUS_FLOW: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  SERVICE_ORDER_PLACED: ['SERVICE_ORDER_CONFIRMED', 'SERVICE_ORDER_REJECTED'],
  SERVICE_ORDER_CONFIRMED: ['BUYER_ARRIVED'],
  SERVICE_ORDER_REJECTED: [],
  BUYER_ARRIVED: ['SERVICE_IN_PROGRESS'],
  SERVICE_IN_PROGRESS: ['SERVICE_COMPLETED'],
  SERVICE_COMPLETED: ['PAYMENT_RECEIVED'],
  PAYMENT_RECEIVED: [],
};

export const normalizeServiceOrderStatus = (status?: string | null): ServiceOrderStatus => {
  if (!status) return 'SERVICE_ORDER_PLACED';
  const normalized = status.toString().trim().toUpperCase();
  if ((SERVICE_ORDER_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as ServiceOrderStatus;
  }
  return 'SERVICE_ORDER_PLACED';
};

export const getServiceOrderStatusLabel = (status?: string | null): string => {
  const normalized = normalizeServiceOrderStatus(status);
  return SERVICE_ORDER_STATUS_LABELS[normalized] ?? normalized;
};
