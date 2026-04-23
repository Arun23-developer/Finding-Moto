import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
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
import type { Order } from "./orders/types";
import { useToast } from "@/hooks/use-toast";
import { createAuthedSocket, type OrderWorkflowSocketEvent } from "@/lib/socket";

export default function OrdersPage() {
  const { toast } = useToast();
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
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const latestEventRef = useRef<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orders");
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      setOrders([]);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const socket = createAuthedSocket();
    if (!socket) return;

    socket.on("order:workflow", (event: OrderWorkflowSocketEvent) => {
      if (event.audience !== "seller") return;
      const eventKey = `${event.orderId}:${event.status}:${event.timestamp}`;
      if (latestEventRef.current === eventKey) return;
      latestEventRef.current = eventKey;

      fetchOrders();
      toast({
        title: event.title,
        description: event.message,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrders, toast]);

  const handleStatusChange = useCallback(
    async (orderId: string, status: Order["status"]) => {
      setUpdatingOrderId(orderId);
      setError(null);
      try {
        await api.patch(`/orders/${orderId}/status`, { status });
        await fetchOrders();
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to update order status");
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [fetchOrders]
  );

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
    pending: orders.filter((order) => ["pending", "awaiting_seller_confirmation"].includes(order.status)).length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    package_ready: orders.filter((order) => order.status === "ready_for_dispatch").length,
    assigned: orders.filter((order) => order.status === "pickup_assigned").length,
    picked_up: orders.filter((order) => order.status === "picked_up").length,
    out_for_delivery: orders.filter((order) => order.status === "out_for_delivery").length,
    delivered: orders.filter((order) => ["delivered", "completed"].includes(order.status)).length,
    delivery_failed: orders.filter((order) => order.status === "delivery_failed").length,
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
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

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
              {[
                "all",
                "awaiting_seller_confirmation",
                "confirmed",
                "ready_for_dispatch",
                "pickup_assigned",
                "picked_up",
                "out_for_delivery",
                "delivered",
                "delivery_failed",
                "cancelled",
              ].map((status) => (
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
                  {status === "all" && `All (${statusCounts.all})`}
                  {status === "awaiting_seller_confirmation" && `Placed (${statusCounts.pending})`}
                  {status === "confirmed" && `Confirmed (${statusCounts.confirmed})`}
                  {status === "ready_for_dispatch" && `Package Ready (${statusCounts.package_ready})`}
                  {status === "pickup_assigned" && `Assigned (${statusCounts.assigned})`}
                  {status === "picked_up" && `Picked Up (${statusCounts.picked_up})`}
                  {status === "out_for_delivery" && `Out for Delivery (${statusCounts.out_for_delivery})`}
                  {status === "delivered" && `Delivered (${statusCounts.delivered})`}
                  {status === "delivery_failed" && `Delivery Failed (${statusCounts.delivery_failed})`}
                  {status === "cancelled" && `Cancelled (${statusCounts.cancelled})`}
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
              onStatusChange={handleStatusChange}
              updatingOrderId={updatingOrderId}
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
