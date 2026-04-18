import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { BuyerDetailsModal } from "./orders/BuyerDetailsModal";
import { getBuyerName } from "./orders/helpers";
import { OrdersTable } from "./orders/OrdersTable";
import type { Order, OrderStats } from "./orders/types";

const mockOrders: Order[] = [
  {
    _id: "mock-order-001",
    buyer: {
      firstName: "Thulasi",
      lastName: "Ram",
      email: "thulasi@example.com",
      phone: "0771234567",
      address: "12 Lake Road",
      city: "Colombo",
      postCode: "00500",
    },
    items: [
      { product: "mock-product-1", name: "Brake Pad Set", price: 4500, qty: 1 },
    ],
    totalAmount: 4500,
    status: "pending",
    shippingAddress: "12 Lake Road, Colombo 00500",
    paymentMethod: "Cash on Delivery",
    createdAt: new Date().toISOString(),
  },
];

export default function OrdersPage() {
  const [agents, setAgents] = useState<{ _id: string; fullName: string; email: string }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/orders/stats");
      setStats(res.data.data || null);
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
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      setOrders(mockOrders);
      setError(err?.response?.data?.message || "Showing sample orders while live data is unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

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

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = search.toLowerCase();
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order._id.toLowerCase().includes(normalizedSearch) ||
      getBuyerName(order.buyer).toLowerCase().includes(normalizedSearch) ||
      order.items.some((item) => item.name.toLowerCase().includes(normalizedSearch));

    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>
        <button
          onClick={() => {
            fetchOrders();
            fetchStats();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-100">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold">
                  {statsLoading ? "..." : `LKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
                </p>
                {stats && (
                  <div className="mt-2 flex items-center gap-1">
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium text-emerald-100">
                      {stats.revenueGrowth >= 0 ? "+" : ""}
                      {stats.revenueGrowth}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-100">Orders This Month</p>
                <p className="mt-1 text-2xl font-bold">
                  {statsLoading ? "..." : stats?.ordersThisMonth || 0}
                </p>
                {stats && (
                  <div className="mt-2 flex items-center gap-1">
                    {stats.orderGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium text-blue-100">
                      {stats.orderGrowth >= 0 ? "+" : ""}
                      {stats.orderGrowth}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-violet-100">Avg. Order Value</p>
                <p className="mt-1 text-2xl font-bold">
                  {statsLoading ? "..." : `LKR ${(stats?.avgOrderValue || 0).toLocaleString()}`}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  <span className="text-xs font-medium text-violet-100">
                    {statsLoading ? "..." : `${stats?.totalOrders || 0} total orders`}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-100">Completion Rate</p>
                <p className="mt-1 text-2xl font-bold">
                  {statsLoading ? "..." : `${stats?.completionRate || 0}%`}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs font-medium text-amber-100">
                    {statsLoading ? "..." : `${stats?.deliveredOrders || 0} delivered`}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {stats.pendingOrders} order{stats.pendingOrders > 1 ? "s" : ""} awaiting your action
            </p>
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
              Confirm or cancel pending orders to keep your customers happy
            </p>
          </div>
          <button
            onClick={() => setStatusFilter("pending")}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
          >
            View Pending
          </button>
        </div>
      )}

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order ID, buyer, or product..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {status === "all"
                    ? `All (${statusCounts.all})`
                    : `${status.charAt(0).toUpperCase() + status.slice(1)} (${statusCounts[status as keyof typeof statusCounts]})`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchOrders} className="ml-auto text-sm font-medium underline">
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <OrdersTable
              orders={filteredOrders}
              allOrdersCount={orders.length}
              error={error}
              onBuyerDetails={setSelectedOrder}
              onAssignDelivery={openAssignDelivery}
            />
          </CardContent>
        </Card>
      )}

      <BuyerDetailsModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />

      <Dialog open={Boolean(assignOrder)} onOpenChange={(open) => !open && setAssignOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Delivery Agent</DialogTitle>
            <DialogDescription>
              Select a delivery agent for order #{assignOrder?._id.slice(-6).toUpperCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <label htmlFor="delivery-agent" className="text-sm font-medium">Delivery Agent</label>
              <select
                id="delivery-agent"
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
            {assignError && (
              <p className="text-sm text-destructive">{assignError}</p>
            )}
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
