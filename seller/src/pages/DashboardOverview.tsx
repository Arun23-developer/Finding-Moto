import { useState, useEffect } from "react";
import { Package, Wrench, ShoppingCart, Star, TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, Loader2, Eye } from "lucide-react";
import { fetchOverview, type OverviewData, type RecentOrder } from "@/services/api";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  Processing: "bg-warning/10 text-warning",
  Completed: "bg-success/10 text-success",
  Shipped: "bg-primary/10 text-primary",
};

export default function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchOverview();
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load overview", err);
        setError("Failed to load dashboard data. Make sure you are logged in as a seller.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-32">
        <p className="text-destructive font-medium">{error || "No data"}</p>
      </div>
    );
  }

  const { stats, recentOrders, topProducts } = data;

  const statCards = [
    { title: "Total Products", value: String(stats.totalProducts), icon: Package, color: "bg-primary/10 text-primary" },
    { title: "Active Products", value: String(stats.activeProducts), icon: TrendingUp, color: "bg-success/10 text-success" },
    { title: "Total Orders", value: String(stats.totalOrders), icon: ShoppingCart, color: "bg-warning/10 text-warning" },
    { title: "Total Views", value: String(stats.totalViews), icon: Eye, color: "bg-accent text-accent-foreground" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.title} className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.title}</p>
                <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl card-shadow p-5">
          <h3 className="font-display font-semibold mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Order</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o: RecentOrder) => (
                    <tr key={o._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">#{o._id.slice(-5)}</td>
                      <td className="py-3 px-2">{o.buyer?.name || o.buyer?.email || "—"}</td>
                      <td className="py-3 px-2 font-medium">${o.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[o.status] || "bg-muted text-muted-foreground"}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl card-shadow p-5">
          <h3 className="font-display font-semibold mb-4">Revenue Summary</h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-display font-bold text-primary">
                ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
            </div>
            <div className="space-y-3">
              <RevenueRow label="Pending Orders" value={String(stats.pendingOrders)} pct={stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0} />
              <RevenueRow label="Delivered Orders" value={String(stats.deliveredOrders)} pct={stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0} />
              <RevenueRow label="Total Orders" value={String(stats.totalOrders)} pct={100} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-card rounded-xl card-shadow p-5">
          <h3 className="font-display font-semibold mb-4">Top Products by Sales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topProducts.map((p) => (
              <div key={p._id} className="border rounded-lg p-3 text-center">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.sales} sold · ${p.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
