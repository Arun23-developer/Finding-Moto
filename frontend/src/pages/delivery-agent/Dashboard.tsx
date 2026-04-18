import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Package, RefreshCw, Truck } from "lucide-react";
import api from "@/services/api";

type DeliveryStatus = "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface DeliveryItem {
  name: string;
  qty: number;
  price: number;
}

interface DeliveryRecord {
  _id: string;
  orderId: string;
  status: DeliveryStatus;
  totalAmount: number;
  order: {
    _id: string;
    items: DeliveryItem[];
    totalAmount: number;
    shippingAddress: string;
    createdAt: string;
    buyer: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
    } | null;
  } | null;
}

const statusConfig: Record<DeliveryStatus, { label: string; action?: DeliveryStatus; actionLabel?: string; className: string }> = {
  ASSIGNED: {
    label: "Pickup Request",
    action: "PICKED_UP",
    actionLabel: "Mark Picked Up",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  PICKED_UP: {
    label: "Picked Up",
    action: "IN_TRANSIT",
    actionLabel: "Mark In Transit",
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  IN_TRANSIT: {
    label: "Out for Delivery",
    className: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  FAILED: {
    label: "Delivery Failed",
    className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
};

const inTransitActions: Array<{ status: DeliveryStatus; label: string }> = [
  { status: "DELIVERED", label: "Mark Delivered" },
  { status: "FAILED", label: "Mark Failed" },
];

const getBuyerName = (delivery: DeliveryRecord) => {
  const buyer = delivery.order?.buyer;
  if (!buyer) return "Assigned Buyer";
  return `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || "Assigned Buyer";
};

export default function DeliveryAgentDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/deliveries/my");
      const rows = Array.isArray(res.data.data) ? res.data.data : [];
      setDeliveries(
        rows.map((row: any) => ({
          _id: row._id,
          orderId: typeof row.orderId === "string" ? row.orderId : row.orderId?._id,
          status: row.status,
          totalAmount: row.order?.totalAmount ?? 0,
          order: row.order,
        }))
      );
    } catch (err: any) {
      setDeliveries([]);
      setError(err?.response?.data?.message || "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleStatusUpdate = useCallback(async (deliveryId: string, nextStatus: DeliveryStatus) => {
    setUpdatingId(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status: nextStatus });
      setDeliveries((current) =>
        current.map((delivery) =>
          delivery._id === deliveryId ? { ...delivery, status: nextStatus } : delivery
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update delivery status");
    } finally {
      setUpdatingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assigned Deliveries</h1>
          <p className="text-sm text-muted-foreground">{deliveries.length} assigned delivery{deliveries.length === 1 ? "" : "ies"}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchDeliveries} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Delivery ID</th>
                    <th className="px-4 py-3 text-left font-medium">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium">Buyer</th>
                    <th className="px-4 py-3 text-left font-medium">Items</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Contact</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => {
                    const cfg = statusConfig[delivery.status];
                    const buyer = delivery.order?.buyer;
                    return (
                      <tr key={delivery._id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-medium text-sky-600">#{delivery._id.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3 font-mono">#{delivery.orderId.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{getBuyerName(delivery)}</p>
                            <p className="text-xs text-muted-foreground">{delivery.order?.buyer?.address || delivery.order?.shippingAddress || ""}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {(delivery.order?.items || []).map((item) => `${item.name} x${item.qty}`).join(", ")}
                        </td>
                        <td className="px-4 py-3 font-semibold">LKR {(delivery.order?.totalAmount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {buyer?.phone || "No phone"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {cfg.action ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === delivery._id}
                              onClick={() => handleStatusUpdate(delivery._id, cfg.action!)}
                            >
                              {updatingId === delivery._id ? "Updating..." : cfg.actionLabel}
                            </Button>
                          ) : delivery.status === "IN_TRANSIT" ? (
                            <div className="flex justify-end gap-2">
                              {inTransitActions.map((action) => (
                                <Button
                                  key={action.status}
                                  size="sm"
                                  variant="outline"
                                  disabled={updatingId === delivery._id}
                                  onClick={() => handleStatusUpdate(delivery._id, action.status)}
                                >
                                  {updatingId === delivery._id ? "Updating..." : action.label}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-2 text-xs ${
                                delivery.status === "FAILED" ? "text-red-600" : "text-emerald-600"
                              }`}
                            >
                              <Truck className="h-4 w-4" />
                              {delivery.status === "FAILED" ? "Failed" : "Completed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {deliveries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p className="font-medium">No assigned deliveries</p>
                        <p className="mt-1 text-xs">Assigned deliveries will appear here once a seller, mechanic, or admin assigns an order to you.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
