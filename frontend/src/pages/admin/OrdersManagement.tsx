import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";

interface Order {
  _id: string;
  buyer: { firstName: string; lastName: string } | null;
  seller: { firstName: string; lastName: string; shopName?: string } | null;
  items: unknown[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  delivered: "bg-success/15 text-success border-success/20",
  shipped: "bg-info/15 text-info border-info/20",
  confirmed: "bg-warning/15 text-warning border-warning/20",
  pending: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get("/admin/orders", { params });
      if (data.success) setOrders(data.data || []);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => ["confirmed", "shipped"].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
        <p className="text-sm font-medium">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-3 text-red-500" />
        <p className="font-medium">{error}</p>
        <button onClick={fetchOrders} className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Order Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage all orders</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: totalCount },
          { label: "Pending", value: pendingCount },
          { label: "Processing", value: processingCount },
          { label: "Delivered", value: deliveredCount },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-display font-bold mt-1">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <Card className="glass-card">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">Order ID</th>
                  <th className="text-left py-3 font-medium">Buyer</th>
                  <th className="text-left py-3 font-medium">Items</th>
                  <th className="text-left py-3 font-medium">Total</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-mono font-medium text-primary text-xs">
                        {order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3">
                        {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">{order.items?.length || 0}</td>
                      <td className="py-3 font-semibold">LKR {order.totalAmount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[order.status] || ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
