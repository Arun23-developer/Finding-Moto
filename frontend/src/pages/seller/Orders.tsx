import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Search,
  Eye,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  X,
  MapPin,
  CreditCard,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";

// ─── Stats Types ───────────────────────────────────────────────────────────
interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  orderGrowth: number;
  revenueGrowth: number;
  completionRate: number;
  recentActionNeeded: { _id: string; status: string; totalAmount: number; createdAt: string }[];
}

// ─── Types ─────────────────────────────────────────────────────────────────
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
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800", icon: XCircle },
};

const nextStatus: Record<string, { status: string; label: string }> = {
  pending: { status: "confirmed", label: "Confirm Order" },
  confirmed: { status: "shipped", label: "Mark Shipped" },
  shipped: { status: "delivered", label: "Mark Delivered" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function getBuyerName(buyer: Order["buyer"]): string {
  if (typeof buyer === "string") return buyer;
  return buyer.name || `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || buyer.email;
}
function getBuyerEmail(buyer: Order["buyer"]): string {
  if (typeof buyer === "string") return "";
  return buyer.email;
}
function getBuyerPhone(buyer: Order["buyer"]): string {
  if (typeof buyer === "string") return "";
  return buyer.phone || "";
}

// ─── Order Detail Modal ─────────────────────────────────────────────────────
function OrderDetailModal({
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
  const StatusIcon = statusConfig[order.status].icon;
  const next = nextStatus[order.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</h2>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" />
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[order.status].color}`}>
              {statusConfig[order.status].label}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Buyer Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">{getBuyerName(order.buyer)}</p>
              <p className="text-muted-foreground">{getBuyerEmail(order.buyer)}</p>
              {getBuyerPhone(order.buyer) && <p className="text-muted-foreground">{getBuyerPhone(order.buyer)}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty: {item.qty} × LKR {item.price.toLocaleString()}</p>
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
            <h3 className="text-sm font-semibold mb-2">Delivery Details</h3>
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
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">
            Close
          </button>
          {next && (
            <button
              disabled={updating}
              onClick={() => onStatusChange(order._id, next.status)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25 disabled:opacity-50 flex items-center gap-2"
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
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Orders Page ────────────────────────────────────────────────────────────
export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/orders/stats");
      const data = res.data.data;
      setStats(data || null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orders");
      const data = res.data.data || [];
      setOrders(data);
    } catch (err: any) {
      setOrders([]);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
      );
      setSelectedOrder((prev) =>
        prev && prev._id === orderId ? { ...prev, status: newStatus as Order["status"] } : prev
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const buyerName = getBuyerName(o.buyer).toLowerCase();
    const id = o._id.toLowerCase();
    const itemNames = o.items.map((i) => i.name.toLowerCase()).join(" ");
    const matchesSearch =
      buyerName.includes(search.toLowerCase()) ||
      id.includes(search.toLowerCase()) ||
      itemNames.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>
        <button onClick={() => { fetchOrders(); fetchStats(); }} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-100">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {statsLoading ? "..." : `LKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
                </p>
                {stats && (
                  <div className="flex items-center gap-1 mt-2">
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium text-emerald-100">
                      {stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-white/15">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders This Month */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-100">Orders This Month</p>
                <p className="text-2xl font-bold mt-1">
                  {statsLoading ? "..." : stats?.ordersThisMonth || 0}
                </p>
                {stats && (
                  <div className="flex items-center gap-1 mt-2">
                    {stats.orderGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium text-blue-100">
                      {stats.orderGrowth >= 0 ? "+" : ""}{stats.orderGrowth}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-white/15">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-violet-100">Avg. Order Value</p>
                <p className="text-2xl font-bold mt-1">
                  {statsLoading ? "..." : `LKR ${(stats?.avgOrderValue || 0).toLocaleString()}`}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <BarChart3 className="h-3 w-3" />
                  <span className="text-xs font-medium text-violet-100">
                    {statsLoading ? "..." : `${stats?.totalOrders || 0} total orders`}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/15">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-100">Completion Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {statsLoading ? "..." : `${stats?.completionRate || 0}%`}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Package className="h-3 w-3" />
                  <span className="text-xs font-medium text-amber-100">
                    {statsLoading ? "..." : `${stats?.deliveredOrders || 0} delivered`}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/15">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Action Alert */}
      {stats && stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {stats.pendingOrders} order{stats.pendingOrders > 1 ? "s" : ""} awaiting your action
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Confirm or cancel pending orders to keep your customers happy
            </p>
          </div>
          <button
            onClick={() => setStatusFilter("pending")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            View Pending
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, buyer, or product..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    statusFilter === s ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {s === "all" ? `All (${statusCounts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s as keyof typeof statusCounts]})`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchOrders} className="ml-auto text-sm font-medium underline">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium">Buyer</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Items</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const next = nextStatus[order.status];
                    return (
                      <tr key={order._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-blue-600">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">
                                {getBuyerName(order.buyer).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{getBuyerName(order.buyer)}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">{getBuyerEmail(order.buyer)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                          {order.items.map((i) => i.name).join(", ").slice(0, 40)}
                          {order.items.map((i) => i.name).join(", ").length > 40 ? "…" : ""}
                        </td>
                        <td className="py-3 px-4 font-semibold">LKR {order.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[order.status].color}`}>
                            {statusConfig[order.status].label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {next && (
                              <button
                                onClick={() => handleStatusChange(order._id, next.status)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              >
                                {next.label}
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
                  {filtered.length === 0 && !error && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No orders found</p>
                        <p className="text-xs mt-1">
                          {orders.length === 0 ? "Orders will appear here when buyers purchase your products" : "Try adjusting your search or filters"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        updating={updating}
      />
    </div>
  );
}
