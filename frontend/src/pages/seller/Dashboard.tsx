import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  BarChart3,
  Activity,
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
  Pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  Processing: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  Shipped: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  Cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  Pending: <Clock className="h-3 w-3" />,
  Processing: <Truck className="h-3 w-3" />,
  Shipped: <Truck className="h-3 w-3" />,
  Delivered: <CheckCircle className="h-3 w-3" />,
  Cancelled: <span className="h-3 w-3">✕</span>,
};

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
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const maxSale = weeklySales.length > 0 ? Math.max(...weeklySales.map((d) => d.revenue)) : 1;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalWeeklyRevenue = weeklySales.reduce((sum, d) => sum + d.revenue, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Loading dashboard</p>
            <p className="text-sm text-muted-foreground">Fetching your shop data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5">
            <p className="text-blue-200 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName || "Seller"}! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Here's what's happening with your shop today.
            </p>
          </div>
          <div
            className="flex items-center gap-3 rounded-xl px-5 py-3 w-fit border border-white/20 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
          >
            <span className="text-2xl">🏪</span>
            <div>
              <p className="text-[11px] text-blue-200 uppercase tracking-wider font-medium">Your Shop</p>
              <p className="font-semibold text-lg leading-tight">{user?.shopName || "My Shop"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products */}
        <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-blue-950/20" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Package className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {stats?.activeProducts ?? 0} active
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{stats?.totalProducts ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-emerald-950/20" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                {stats?.pendingOrders ?? 0} pending
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{stats?.totalOrders ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-amber-950/20" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                {stats?.deliveredOrders ?? 0} delivered
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(stats?.revenue ?? 0)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        {/* Views */}
        <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-purple-950/20" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Eye className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                <Activity className="h-3 w-3" />
                All products
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{stats?.totalViews ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Order Status Summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{stats?.pendingOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground font-medium">Pending</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground font-medium">Processing</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{stats?.deliveredOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground font-medium">Delivered</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800/50">
            <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{stats?.totalOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Weekly Sales Chart */}
        <Card className="lg:col-span-2 border border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Weekly Revenue</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Daily sales performance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalWeeklyRevenue)}</p>
                <p className="text-[11px] text-muted-foreground">This week</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-5">
            <div className="flex items-end gap-3 h-[200px]">
              {weeklySales.length > 0 ? weeklySales.map((item, idx) => {
                const date = new Date(item._id);
                const dayName = dayNames[date.getDay()];
                const heightPct = Math.max((item.revenue / maxSale) * 100, 6);
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <div key={item._id} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                    {/* Tooltip on hover */}
                    <div className="text-[11px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      LKR {item.revenue.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ease-out ${
                          isToday
                            ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/25'
                            : 'bg-gradient-to-t from-blue-400 to-blue-300 dark:from-blue-600 dark:to-blue-500'
                        } group-hover:from-blue-600 group-hover:to-indigo-500 group-hover:shadow-md group-hover:shadow-blue-500/20`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    {/* Day label */}
                    <span className={`text-[11px] font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                      {dayName}
                    </span>
                    {isToday && <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </div>
                );
              }) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-8">
                  <BarChart3 className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No sales data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Top Products</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Best sellers this month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1">
              {topProducts.length > 0 ? topProducts.map((product, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={product.name} className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/60 transition-colors group cursor-pointer">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                      {idx < 3 ? medals[idx] : <span className="text-muted-foreground">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">{product.sales} sold</span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className={`text-[11px] font-medium ${product.stock > 5 ? 'text-emerald-600 dark:text-emerald-400' : product.stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No products yet</p>
                  <Link to="/seller/products" className="text-xs text-blue-600 mt-1 hover:underline">Add your first product</Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Orders ── */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest customer purchases</p>
              </div>
            </div>
            <Link
              to="/seller/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Product</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentOrders.length > 0 ? recentOrders.map((order) => {
                  const statusKey = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                  return (
                    <tr key={order._id} className="hover:bg-muted/40 transition-colors group">
                      <td className="py-3.5 px-6">
                        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-sm">
                            {order.buyer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{order.buyer.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground truncate block max-w-[180px]">{order.items[0]?.name || 'N/A'}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColors[statusKey] || statusColors.Pending}`}
                        >
                          {statusIcons[statusKey]}
                          {statusKey}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No orders yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Orders will appear here once customers start buying</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/seller/products" className="block">
          <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-blue-950/20" />
            <CardContent className="relative p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Package className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">Manage Products</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add, edit or remove listings</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/seller/ai-chat" className="block">
          <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-purple-950/20" />
            <CardContent className="relative p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Eye className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">AI Assistant</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get smart sales insights</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/seller/reviews" className="block">
          <Card className="group relative overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-amber-950/20" />
            <CardContent className="relative p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Star className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">View Reviews</p>
                <p className="text-xs text-muted-foreground mt-0.5">Check customer feedback</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
