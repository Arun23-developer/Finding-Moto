import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "@/services/api";

const statusColors: Record<string, string> = {
  delivered: "bg-success/15 text-success border-success/20",
  shipped: "bg-info/15 text-info border-info/20",
  confirmed: "bg-warning/15 text-warning border-warning/20",
  pending: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
};

const catColors = [
  "hsl(25, 95%, 53%)",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 65%, 60%)",
  "hsl(38, 92%, 50%)",
];

interface OverviewData {
  stats: {
    revenue: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    activeSellers: number;
  };
  recentOrders: {
    _id: string;
    buyer: { firstName: string; lastName: string } | null;
    seller: { firstName: string; lastName: string; shopName?: string } | null;
    totalAmount: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }[];
  categories: { name: string; value: number }[];
  monthlyRevenue: { _id: string; revenue: number }[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = useCallback(async () => {
    try {
      setError("");
      const { data: res } = await api.get("/admin/overview");
      if (res.success) setData(res.data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
        <p className="text-sm font-medium">Loading dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-3 text-red-500" />
        <p className="font-medium">{error}</p>
        <button onClick={fetchOverview} className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const { stats, recentOrders, categories, monthlyRevenue } = data;
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No revenue data yet</p>
            ) : (
              <div className="flex items-end gap-3 h-[250px] pt-4">
                {monthlyRevenue.map((item) => {
                  const label = new Date(item._id + "-01").toLocaleString("default", { month: "short" });
                  return (
                    <div key={item._id} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {(item.revenue / 1000).toFixed(1)}k
                      </span>
                      <div className="w-full relative flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors duration-200 min-h-[8px]"
                          style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full space-y-3 mt-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              ) : (
                categories.map((cat, i) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: catColors[i % catColors.length] }}
                        />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.value}%`,
                          backgroundColor: catColors[i % catColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <a href="/admin/orders" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">Order ID</th>
                  <th className="text-left py-3 font-medium">Buyer</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No orders yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-mono font-medium text-primary text-xs">
                        {order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3">
                        {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : "—"}
                      </td>
                      <td className="py-3 font-semibold">LKR {order.totalAmount.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[order.status] || ""}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{timeAgo(order.createdAt)}</td>
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
