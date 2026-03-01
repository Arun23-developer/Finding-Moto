import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface DashboardStats {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
}

interface RecentOrder {
  _id: string;
  buyer: { name: string; email: string };
  items: { name: string }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TopProduct {
  name: string;
  category: string;
  sales: number;
  price: number;
  stock: number;
}

interface WeeklySale {
  _id: string;
  revenue: number;
  orders: number;
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Processing: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Shipped: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
};

const maxSale = Math.max(...weeklySales.map((d) => d.amount));

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [weeklySales, setWeeklySales] = useState<WeeklySale[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, analyticsRes] = await Promise.all([
        api.get('/seller/overview'),
        api.get('/seller/analytics'),
      ]);

      if (overviewRes.data.success) {
        setStats(overviewRes.data.data.stats);
        setRecentOrders(overviewRes.data.data.recentOrders);
        setTopProducts(overviewRes.data.data.topProducts);
      }

      if (analyticsRes.data.success) {
        setWeeklySales(analyticsRes.data.data.dailyRevenue);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `LKR ${amount.toLocaleString()}`;
  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const statsCards = stats ? [
    { title: "Total Products", value: stats.totalProducts.toString(), change: `${stats.activeProducts} active`, trend: "up" as const, icon: Package, color: "text-blue-600", bg: "bg-blue-600/10" },
    { title: "Total Orders", value: stats.totalOrders.toString(), change: `${stats.pendingOrders} pending`, trend: "up" as const, icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-600/10" },
    { title: "Revenue", value: formatCurrency(stats.revenue), change: `${stats.deliveredOrders} delivered`, trend: "up" as const, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-600/10" },
    { title: "Total Views", value: stats.totalViews.toString(), change: "All products", trend: "up" as const, icon: Eye, color: "text-purple-600", bg: "bg-purple-600/10" },
  ] : [];

  const orderStatusSummary = stats ? [
    { label: "Pending", count: stats.pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Processing", count: 0, icon: Truck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Delivered", count: stats.deliveredOrders, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Total", count: stats.totalOrders, icon: ShoppingCart, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-950/30" },
  ] : [];

  const maxSale = weeklySales.length > 0 ? Math.max(...weeklySales.map((d) => d.revenue)) : 1;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
                Welcome back, {user?.firstName || "Seller"}! 👋
              </h1>
              <p className="text-blue-50/90 text-lg">
                Here's what's happening with your shop today.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 w-fit border border-white/30 shadow-lg hover:bg-white/25 transition-all">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-xs text-blue-100 uppercase tracking-wider">Your Shop</p>
                <p className="font-semibold text-lg">{user?.shopName || "My Shop"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((stat, idx) => (
          <Card key={stat.title} className="stat-card-hover glass-card border-0 shadow-lg hover:shadow-xl group" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    stat.trend === "up" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStatusSummary.map((item, idx) => (
          <div key={item.label} className={`flex items-center gap-4 rounded-xl border-2 p-5 ${item.bg} hover:scale-105 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg`} style={{ animationDelay: `${idx * 50}ms` }}>
            <div className={`w-12 h-12 rounded-xl ${item.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Sales Chart */}
        <Card className="lg:col-span-2 glass-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Weekly Sales</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Track your daily performance</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 px-3 py-1.5 rounded-full">This Week</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-[220px] pt-4">
              {weeklySales.length > 0 ? weeklySales.map((item, idx) => {
                const date = new Date(item._id);
                const dayName = dayNames[date.getDay()];
                return (
                  <div key={item._id} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs text-muted-foreground font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      LKR {(item.revenue / 1000).toFixed(1)}k
                    </span>
                    <div className="w-full relative flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 min-h-[12px] shadow-lg hover:shadow-xl cursor-pointer"
                        style={{ height: `${(item.revenue / maxSale) * 100}%`, animationDelay: `${idx * 100}ms` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{dayName}</span>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center text-muted-foreground py-8">No sales data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-lg font-bold">Top Products</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Best sellers this month</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 cursor-pointer group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-md ${
                  idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-950/50'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{product.sales} sold · {product.stock} in stock</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price * product.sales)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-4">No products yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest customer purchases</p>
            </div>
            <Link to="/seller/orders" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">Order ID</th>
                  <th className="text-left py-3 font-medium">Buyer</th>
                  <th className="text-left py-3 font-medium hidden md:table-cell">Product</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => {
                  const statusKey = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                  return (
                    <tr key={order._id} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-all duration-200 cursor-pointer group">
                      <td className="py-4 font-mono font-bold text-blue-600 group-hover:text-blue-700">#{order._id.slice(-6)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <span className="text-sm font-bold text-white">{order.buyer.name.charAt(0)}</span>
                          </div>
                          <span className="hidden sm:inline font-medium">{order.buyer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground hidden md:table-cell font-medium">{order.items[0]?.name || 'N/A'}</td>
                      <td className="py-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColors[statusKey] || statusColors.Pending}`}
                        >
                          {statusKey}
                        </span>
                      </td>
                      <td className="py-4 text-right text-muted-foreground font-medium">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link to="/seller/products">
          <Card className="glass-card border-0 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">Manage Products</p>
                <p className="text-sm text-muted-foreground">Add, edit or remove listings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/seller/ai-chat">
          <Card className="glass-card border-0 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">AI Assistant</p>
                <p className="text-sm text-muted-foreground">Get smart sales insights</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/seller/reviews">
          <Card className="glass-card border-0 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Star className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">View Reviews</p>
                <p className="text-sm text-muted-foreground">Check customer feedback</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
