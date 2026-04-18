import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Loader2, Package, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/services/api";

type DeliveryStatus = "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface DeliveryItem {
  name?: string;
  qty?: number;
}

interface DeliveryBuyer {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

interface DeliveryOrder {
  _id?: string;
  items?: DeliveryItem[];
  totalAmount?: number;
  shippingAddress?: string;
  buyer?: DeliveryBuyer | null;
}

interface DeliveryRecord {
  _id: string;
  orderId?: string;
  status: DeliveryStatus;
  createdAt?: string;
  deliveredAt?: string | null;
  order?: DeliveryOrder | null;
}

const statusConfig: Record<DeliveryStatus, { label: string; className: string }> = {
  ASSIGNED: {
    label: "Assigned",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  PICKED_UP: {
    label: "Picked Up",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  IN_TRANSIT: {
    label: "In Transit",
    className:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
  },
  DELIVERED: {
    label: "Delivered",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  FAILED: {
    label: "Delivery Failed",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
};

const getText = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

const getBuyerName = (delivery: DeliveryRecord) => {
  const firstName = delivery.order?.buyer?.firstName?.trim() || "";
  const lastName = delivery.order?.buyer?.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "-";
};

const getFullAddress = (delivery: DeliveryRecord) =>
  getText(delivery.order?.buyer?.address || delivery.order?.shippingAddress);

const getOrderIdLabel = (value?: string) => (value ? `#${value.slice(-6).toUpperCase()}` : "-");
const getDeliveryIdLabel = (value?: string) => (value ? `#${value.slice(-6).toUpperCase()}` : "-");

const getItemsSummary = (delivery: DeliveryRecord) => {
  const items = Array.isArray(delivery.order?.items) ? delivery.order?.items : [];
  if (!items.length) return "-";
  return items
    .map((item) => `${getText(item.name)} x${typeof item.qty === "number" ? item.qty : "-"}`)
    .join(", ");
};

const getAmountLabel = (delivery: DeliveryRecord) => {
  const amount = delivery.order?.totalAmount;
  return typeof amount === "number" ? `LKR ${amount.toLocaleString()}` : "-";
};

const getDateLabel = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

export default function DeliveryCompletedPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/deliveries/my");
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setDeliveries(
        rows.map((row: any) => ({
          _id: typeof row?._id === "string" ? row._id : "",
          orderId:
            typeof row?.orderId === "string"
              ? row.orderId
              : typeof row?.orderId?._id === "string"
                ? row.orderId._id
                : undefined,
          status: row?.status,
          createdAt: typeof row?.createdAt === "string" ? row.createdAt : undefined,
          deliveredAt: typeof row?.deliveredAt === "string" ? row.deliveredAt : null,
          order: row?.order || null,
        }))
      );
    } catch (err: any) {
      setDeliveries([]);
      setError(err?.response?.data?.message || "Failed to load completed deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const completedDeliveries = useMemo(
    () => deliveries.filter((delivery) => delivery.status === "DELIVERED" || delivery.status === "FAILED"),
    [deliveries]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Completed Deliveries</h1>
          <p className="text-sm text-muted-foreground">
            {completedDeliveries.length} completed deliver{completedDeliveries.length === 1 ? "y" : "ies"}
          </p>
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
                    <th className="px-4 py-3 text-left font-medium">Buyer Name</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Delivered Date</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">View Details</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDeliveries.map((delivery) => {
                    const cfg = statusConfig[delivery.status];
                    return (
                      <tr
                        key={delivery._id}
                        className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-sky-600">
                          {getDeliveryIdLabel(delivery._id)}
                        </td>
                        <td className="px-4 py-3 font-mono">{getOrderIdLabel(delivery.orderId)}</td>
                        <td className="px-4 py-3 font-medium">{getBuyerName(delivery)}</td>
                        <td className="px-4 py-3 font-semibold">{getAmountLabel(delivery)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{getDateLabel(delivery.deliveredAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {completedDeliveries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p className="font-medium">No completed deliveries</p>
                        <p className="mt-1 text-xs">
                          Delivered orders will appear here once a delivery is marked as completed.
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

      <Dialog open={Boolean(selectedDelivery)} onOpenChange={(open) => !open && setSelectedDelivery(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDelivery ? getDeliveryIdLabel(selectedDelivery._id) : "Delivery Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedDelivery
                ? `Completed delivery details for order ${getOrderIdLabel(selectedDelivery.orderId)}`
                : "Completed delivery details"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Delivery ID</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getDeliveryIdLabel(selectedDelivery._id) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Order ID</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getOrderIdLabel(selectedDelivery.orderId) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Buyer Name</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getBuyerName(selectedDelivery) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getText(selectedDelivery.order?.buyer?.phone) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Address</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getFullAddress(selectedDelivery) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Items</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getItemsSummary(selectedDelivery) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Amount</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getAmountLabel(selectedDelivery) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Delivered Date / Time</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedDelivery ? getDateLabel(selectedDelivery.deliveredAt) : "-"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
