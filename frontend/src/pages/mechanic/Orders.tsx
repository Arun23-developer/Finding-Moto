import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { createAuthedSocket, type OrderWorkflowSocketEvent } from "@/lib/socket";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface Order {
  _id: string;
  buyer: { _id: string; name?: string; firstName?: string; lastName?: string; email: string; phone?: string } | string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  order_type?: "product" | "service" | string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

type ServiceOrderStatus =
  | "SERVICE_ORDER_PLACED"
  | "SERVICE_ORDER_CONFIRMED"
  | "BUYER_ARRIVED"
  | "SERVICE_IN_PROGRESS"
  | "SERVICE_COMPLETED"
  | "PAYMENT_RECEIVED"
  | "SERVICE_ORDER_REJECTED";

interface ServiceOrder {
  _id: string;
  buyer: { _id?: string; firstName?: string; lastName?: string; email?: string; phone?: string };
  serviceName: string;
  servicePrice: number;
  bookingDate: string;
  notes?: string;
  status: ServiceOrderStatus;
  statusHistory?: Array<{ status: ServiceOrderStatus; changedAt: string; note?: string }>;
  createdAt: string;
}

const productStatusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800", icon: Clock },
  confirmed: { label: "Accepted", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800", icon: CheckCircle },
  shipped: { label: "In Progress", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800", icon: Truck },
  delivered: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800", icon: XCircle },
};

const serviceStatusConfig: Record<ServiceOrderStatus, { label: string; color: string; icon: typeof Clock | typeof CheckCircle | typeof Truck | typeof MapPin | typeof XCircle }> = {
  SERVICE_ORDER_PLACED: { label: "Placed", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800", icon: Clock },
  SERVICE_ORDER_CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800", icon: CheckCircle },
  BUYER_ARRIVED: { label: "Arrived", color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800", icon: MapPin },
  SERVICE_IN_PROGRESS: { label: "In Progress", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800", icon: Truck },
  SERVICE_COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle },
  PAYMENT_RECEIVED: { label: "Payment Done", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle },
  SERVICE_ORDER_REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800", icon: XCircle },
};

const nextProductStatus: Record<string, { status: string; label: string }> = {
  pending: { status: "confirmed", label: "Accept Job" },
  confirmed: { status: "shipped", label: "Start Work" },
  shipped: { status: "delivered", label: "Mark Completed" },
};

const serviceStatusFilters = [
  "all",
  "SERVICE_ORDER_PLACED",
  "SERVICE_ORDER_CONFIRMED",
  "BUYER_ARRIVED",
  "SERVICE_IN_PROGRESS",
  "SERVICE_COMPLETED",
  "PAYMENT_RECEIVED",
  "SERVICE_ORDER_REJECTED",
] as const;

const productStatusFilters = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function getStatusMeta(status?: string) {
  const meta = status ? productStatusConfig[status] : undefined;
  return (
    meta || {
      label: status ? status.split("_").join(" ") : "Unknown",
      color: "bg-muted text-muted-foreground border-border",
      icon: Clock,
    }
  );
}

function getBuyerName(buyer: Order["buyer"] | ServiceOrder["buyer"]): string {
  if (typeof buyer === "string") return buyer;
  return buyer?.name || `${buyer?.firstName || ""} ${buyer?.lastName || ""}`.trim() || buyer?.email || "Customer";
}

function getBuyerEmail(buyer: Order["buyer"] | ServiceOrder["buyer"]): string {
  if (typeof buyer === "string") return "";
  return buyer?.email || "";
}

function getBuyerPhone(buyer: Order["buyer"] | ServiceOrder["buyer"]): string {
  if (typeof buyer === "string") return "";
  return buyer?.phone || "";
}

function getOrderType(order: Order): "product" | "service" | "unknown" {
  const raw = (order.order_type || "").toString().toLowerCase();
  if (raw === "product" || raw === "service") return raw;
  return "unknown";
}

function getPrimaryItemName(items: OrderItem[]): string {
  if (!items?.length) return "--";
  if (items.length === 1) return items[0]?.name || "--";
  const names = items.map((item) => item.name).filter(Boolean);
  return names.length ? `${names[0]} +${Math.max(0, names.length - 1)}` : "--";
}

function ProductOrderDetailModal({
  order,
  onClose,
  onStatusChange,
  updating,
}: {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  updating: boolean;
}) {
  if (!order) return null;

  const statusMeta = getStatusMeta(order.status);
  const StatusIcon = statusMeta.icon;
  const next = nextProductStatus[order.status];
  const orderType = getOrderType(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">
              {orderType === "service" ? "Service Booking" : "Product Order"} #{order._id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" />
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">{getBuyerName(order.buyer)}</p>
              <p className="text-muted-foreground">{getBuyerEmail(order.buyer)}</p>
              {getBuyerPhone(order.buyer) && <p className="text-muted-foreground">{getBuyerPhone(order.buyer)}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Product Details</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty: {item.qty} x LKR {item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-bold">LKR {(item.qty * item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <span className="text-sm text-muted-foreground">Total: </span>
              <span className="text-lg font-bold">LKR {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Additional Details</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p>{order.shippingAddress}</p>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p>{order.paymentMethod}</p>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Close</button>
          {next && (
            <button
              disabled={updating}
              onClick={() => onStatusChange(order._id, next.status)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              {next.label}
            </button>
          )}
          {order.status === "pending" && (
            <button
              disabled={updating}
              onClick={() => onStatusChange(order._id, "cancelled")}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              Decline
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceOrderDetailModal({
  order,
  onClose,
  onStatusChange,
  updating,
}: {
  order: ServiceOrder | null;
  onClose: () => void;
  onStatusChange: (orderId: string, action: string) => void;
  updating: boolean;
}) {
  if (!order) return null;

  const statusMeta = serviceStatusConfig[order.status];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Service Booking #{order._id.slice(-6).toUpperCase()}</h2>
            <p className="text-sm text-muted-foreground">{new Date(order.bookingDate).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" />
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold mb-3">Customer Information</p>
              <div className="space-y-2 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  {getBuyerName(order.buyer)}
                </p>
                {getBuyerEmail(order.buyer) && <p className="text-muted-foreground">{getBuyerEmail(order.buyer)}</p>}
                {getBuyerPhone(order.buyer) && <p className="text-muted-foreground">{getBuyerPhone(order.buyer)}</p>}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold mb-3">Booking Details</p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.serviceName}</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {new Date(order.bookingDate).toLocaleString()}
                </p>
                <p className="text-muted-foreground">Price: LKR {order.servicePrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold mb-2">Notes</p>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold mb-3">Status History</p>
              <div className="space-y-2">
                {order.statusHistory.map((entry, index) => (
                  <div key={`${entry.status}-${entry.changedAt}-${index}`} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium">{serviceStatusConfig[entry.status]?.label || entry.status}</p>
                      {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(entry.changedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Close</button>
          {order.status === "SERVICE_ORDER_PLACED" && (
            <>
              <Button disabled={updating} onClick={() => onStatusChange(order._id, "accept")}>
                {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Accept
              </Button>
              <Button disabled={updating} variant="destructive" onClick={() => onStatusChange(order._id, "reject")}>
                {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Reject
              </Button>
            </>
          )}
          {order.status === "BUYER_ARRIVED" && (
            <Button disabled={updating} onClick={() => onStatusChange(order._id, "start")}>
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Start Service
            </Button>
          )}
          {order.status === "SERVICE_IN_PROGRESS" && (
            <Button disabled={updating} onClick={() => onStatusChange(order._id, "complete")}>
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Complete Job
            </Button>
          )}
          {order.status === "SERVICE_COMPLETED" && (
            <Button disabled={updating} onClick={() => onStatusChange(order._id, "payment_received")}>
              {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Mark Payment Received
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MechanicOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"product" | "service">("product");
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const [agents, setAgents] = useState<{ _id: string; fullName: string; email: string }[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setProductLoading(true);
    setProductError(null);
    try {
      const res = await api.get("/orders");
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setOrders(data.filter((order: Order) => getOrderType(order) === "product"));
    } catch (err: any) {
      setProductError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setProductLoading(false);
    }
  }, []);

  const fetchServiceOrders = useCallback(async () => {
    setServiceLoading(true);
    setServiceError(null);
    try {
      const res = await api.get("/service-orders/mechanic");
      setServiceOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      setServiceError(err?.response?.data?.message || "Failed to load service orders");
    } finally {
      setServiceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchServiceOrders();
  }, [fetchOrders, fetchServiceOrders]);

  useEffect(() => {
    setSearch("");
  }, [activeTab]);

  useEffect(() => {
    const socket = createAuthedSocket();
    if (!socket) return;

    const handleWorkflowEvent = (event: OrderWorkflowSocketEvent) => {
      if (event.audience !== "seller") return;
      fetchOrders();
      fetchServiceOrders();
    };

    socket.on("order:workflow", handleWorkflowEvent);

    return () => {
      socket.off("order:workflow", handleWorkflowEvent);
      socket.disconnect();
    };
  }, [fetchOrders, fetchServiceOrders]);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleServiceOrderStatusChange = async (orderId: string, action: string) => {
    setUpdating(true);
    try {
      await api.put(`/service-orders/${orderId}/status`, { action });
      await fetchServiceOrders();
      setSelectedServiceOrder(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update service order status");
    } finally {
      setUpdating(false);
    }
  };

  const openAssignDelivery = useCallback(async (order: Order) => {
    setAssignOrder(order);
    setSelectedAgentId("");
    setAssignError(null);
    try {
      const res = await api.get("/deliveries/agents");
      setAgents(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      setAgents([]);
      setAssignError(err?.response?.data?.message || "Failed to load delivery agents");
    }
  }, []);

  const handleAssignDelivery = useCallback(async () => {
    if (!assignOrder || !selectedAgentId) {
      setAssignError("Please select a delivery agent");
      return;
    }

    setAssignLoading(true);
    setAssignError(null);
    try {
      await api.post("/deliveries/assign", {
        orderId: assignOrder._id,
        agentId: selectedAgentId,
      });
      setAssignOrder(null);
      setSelectedAgentId("");
      await fetchOrders();
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || "Failed to assign delivery");
    } finally {
      setAssignLoading(false);
    }
  }, [assignOrder, fetchOrders, selectedAgentId]);

  const filteredProductOrders = orders
    .filter((order) => productStatusFilter === "all" || order.status === productStatusFilter)
    .filter((order) => {
      const query = search.toLowerCase();
      return (
        getBuyerName(order.buyer).toLowerCase().includes(query) ||
        order._id.toLowerCase().includes(query) ||
        getPrimaryItemName(order.items).toLowerCase().includes(query)
      );
    });

  const filteredServiceOrders = serviceOrders
    .filter((order) => serviceStatusFilter === "all" || order.status === serviceStatusFilter)
    .filter((order) => {
      const query = search.toLowerCase();
      return (
        getBuyerName(order.buyer).toLowerCase().includes(query) ||
        order._id.toLowerCase().includes(query) ||
        (order.serviceName || "").toLowerCase().includes(query)
      );
    });

  const productStatusCounts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  };

  const serviceStatusCounts = {
    all: serviceOrders.length,
    SERVICE_ORDER_PLACED: serviceOrders.filter((order) => order.status === "SERVICE_ORDER_PLACED").length,
    SERVICE_ORDER_CONFIRMED: serviceOrders.filter((order) => order.status === "SERVICE_ORDER_CONFIRMED").length,
    BUYER_ARRIVED: serviceOrders.filter((order) => order.status === "BUYER_ARRIVED").length,
    SERVICE_IN_PROGRESS: serviceOrders.filter((order) => order.status === "SERVICE_IN_PROGRESS").length,
    SERVICE_COMPLETED: serviceOrders.filter((order) => order.status === "SERVICE_COMPLETED").length,
    PAYMENT_RECEIVED: serviceOrders.filter((order) => order.status === "PAYMENT_RECEIVED").length,
    SERVICE_ORDER_REJECTED: serviceOrders.filter((order) => order.status === "SERVICE_ORDER_REJECTED").length,
  };

  const isRefreshing = activeTab === "product" ? productLoading : serviceLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {activeTab === "product" ? `${orders.length} product orders` : `${serviceOrders.length} service bookings`}
          </p>
        </div>
        <button
          onClick={() => {
            fetchOrders();
            fetchServiceOrders();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /> Refresh
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value === "service" ? "service" : "product")}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="product">Product Orders</TabsTrigger>
          <TabsTrigger value="service">Service Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((status) => {
              const Icon = productStatusConfig[status].icon;
              return (
                <button
                  key={status}
                  onClick={() => setProductStatusFilter(productStatusFilter === status ? "all" : status)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    productStatusFilter === status ? "ring-2 ring-amber-500 border-amber-500" : "hover:border-amber-300"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{productStatusConfig[status].label}</span>
                  </div>
                  <p className="text-2xl font-bold">{productStatusCounts[status]}</p>
                </button>
              );
            })}
          </div>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by order ID, customer, or product..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {productStatusFilters.map((status) => (
                    <button
                      key={status}
                      onClick={() => setProductStatusFilter(status)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        productStatusFilter === status ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {status === "all" ? `All (${productStatusCounts.all})` : `${productStatusConfig[status]?.label || status} (${productStatusCounts[status]})`}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {productError && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{productError}</p>
              <button onClick={fetchOrders} className="ml-auto text-sm font-medium underline">Retry</button>
            </div>
          )}

          {productLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!productLoading && (
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium">Customer Name</th>
                        <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Product Name</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Order Date</th>
                        <th className="text-left py-3 px-4 font-medium">Order Status</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProductOrders.map((order) => {
                        const next = nextProductStatus[order.status];
                        const statusMeta = getStatusMeta(order.status);
                        return (
                          <tr key={order._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-amber-600">#{order._id.slice(-6).toUpperCase()}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-600/10 flex items-center justify-center">
                                  <span className="text-xs font-bold text-amber-600">{getBuyerName(order.buyer).charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{getBuyerName(order.buyer)}</p>
                                  <p className="text-xs text-muted-foreground hidden sm:block">{getBuyerEmail(order.buyer)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{getPrimaryItemName(order.items)}</td>
                            <td className="py-3 px-4 font-semibold">LKR {order.totalAmount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusMeta.color}`}>
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                {next && (
                                  <button
                                    onClick={() => handleStatusChange(order._id, next.status)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                                  >
                                    {next.label}
                                  </button>
                                )}
                                {(order.status === "confirmed" || order.status === "shipped") && (
                                  <button
                                    onClick={() => openAssignDelivery(order)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                                  >
                                    Assign Delivery
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProductOrders.length === 0 && !productError && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No product orders found</p>
                            <p className="text-xs mt-1">{orders.length === 0 ? "Product orders will appear here when customers purchase your products" : "Try adjusting your search or filters"}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="service" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {(serviceStatusFilters.slice(1) as ServiceOrderStatus[]).map((status) => {
              const Icon = serviceStatusConfig[status].icon;
              const count = serviceStatusCounts[status];
              return (
                <button
                  key={status}
                  onClick={() => setServiceStatusFilter(serviceStatusFilter === status ? "all" : status)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    serviceStatusFilter === status ? "ring-2 ring-amber-500 border-amber-500" : "hover:border-amber-300"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{serviceStatusConfig[status].label}</span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                </button>
              );
            })}
          </div>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by booking ID, customer, or service..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {serviceStatusFilters.map((status) => {
                    const count = status === "all" ? serviceStatusCounts.all : serviceStatusCounts[status];
                    return (
                      <button
                        key={status}
                        onClick={() => setServiceStatusFilter(status)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          serviceStatusFilter === status ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {status === "all" ? `All (${count})` : `${serviceStatusConfig[status].label} (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {serviceError && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{serviceError}</p>
              <button onClick={fetchServiceOrders} className="ml-auto text-sm font-medium underline">Retry</button>
            </div>
          )}

          {serviceLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!serviceLoading && (
            <Card className="glass-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium">Booking ID</th>
                        <th className="text-left py-3 px-4 font-medium">Customer Name</th>
                        <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Service Name</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                        <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Booking Date / Time</th>
                        <th className="text-left py-3 px-4 font-medium">Booking Status</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServiceOrders.map((order) => {
                        const statusMeta = serviceStatusConfig[order.status];
                        return (
                          <tr key={order._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-amber-600">#{order._id.slice(-6).toUpperCase()}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-600/10 flex items-center justify-center">
                                  <span className="text-xs font-bold text-amber-600">{getBuyerName(order.buyer).charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{getBuyerName(order.buyer)}</p>
                                  <p className="text-xs text-muted-foreground hidden sm:block">{getBuyerEmail(order.buyer)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{order.serviceName}</td>
                            <td className="py-3 px-4 font-semibold">LKR {order.servicePrice?.toLocaleString()}</td>
                            <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{new Date(order.bookingDate).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusMeta.color}`}>
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {order.status === "SERVICE_ORDER_PLACED" && (
                                  <>
                                    <button
                                      onClick={() => handleServiceOrderStatusChange(order._id, "accept")}
                                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleServiceOrderStatusChange(order._id, "reject")}
                                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {order.status === "BUYER_ARRIVED" && (
                                  <button
                                    onClick={() => handleServiceOrderStatusChange(order._id, "start")}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                                  >
                                    Start Service
                                  </button>
                                )}
                                {order.status === "SERVICE_IN_PROGRESS" && (
                                  <button
                                    onClick={() => handleServiceOrderStatusChange(order._id, "complete")}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                  >
                                    Complete Job
                                  </button>
                                )}
                                {order.status === "SERVICE_COMPLETED" && (
                                  <button
                                    onClick={() => handleServiceOrderStatusChange(order._id, "payment_received")}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                  >
                                    Mark Payment Received
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedServiceOrder(order)}
                                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredServiceOrders.length === 0 && !serviceError && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No service bookings found</p>
                            <p className="text-xs mt-1">{serviceOrders.length === 0 ? "Service bookings will appear here when customers book your services" : "Try adjusting your search or filters"}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ProductOrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} updating={updating} />
      <ServiceOrderDetailModal order={selectedServiceOrder} onClose={() => setSelectedServiceOrder(null)} onStatusChange={handleServiceOrderStatusChange} updating={updating} />

      <Dialog open={Boolean(assignOrder)} onOpenChange={(open) => !open && setAssignOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Delivery Agent</DialogTitle>
            <DialogDescription>
              Select a delivery agent for request #{assignOrder?._id.slice(-6).toUpperCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <label htmlFor="mechanic-delivery-agent" className="text-sm font-medium">Delivery Agent</label>
              <select
                id="mechanic-delivery-agent"
                value={selectedAgentId}
                onChange={(event) => setSelectedAgentId(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                disabled={assignLoading}
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.fullName} {agent.email ? `(${agent.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignOrder(null)} disabled={assignLoading}>
              Cancel
            </Button>
            <Button onClick={handleAssignDelivery} disabled={assignLoading}>
              {assignLoading ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
