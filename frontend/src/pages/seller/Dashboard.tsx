import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend,
} from "recharts";

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
  buyer: { name?: string; firstName?: string; lastName?: string; email: string };
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
        const s = overviewRes.data.data.stats;
        const ro = overviewRes.data.data.recentOrders;
        const tp = overviewRes.data.data.topProducts;
        setStats(s || null);
        setRecentOrders(ro || []);
        setTopProducts(tp || []);
      } else {
        setStats(null);
        setRecentOrders([]);
        setTopProducts([]);
      }

      setWeeklySales(analyticsRes.data.success ? (analyticsRes.data.data.dailyRevenue || []) : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(null);
      setRecentOrders([]);
      setTopProducts([]);
      setWeeklySales([]);
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
  const fmt = (n: number) => `LKR ${n.toLocaleString()}`;
  const sellerFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Seller';

  // Chart data
  const revenueChartData = useMemo(() =>
    weeklySales.map(item => {
      const date = new Date(item._id);
      return { day: dayNames[date.getDay()], revenue: item.revenue, orders: item.orders };
    }), [weeklySales]);

  const orderStatusData = useMemo(() => {
    const pending = stats?.pendingOrders ?? 0;
    const delivered = stats?.deliveredOrders ?? 0;
    const confirmed = recentOrders.filter(o => o.status.toLowerCase() === 'confirmed').length;
    const shipped = recentOrders.filter(o => o.status.toLowerCase() === 'shipped').length;
    return [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Confirmed', value: confirmed, color: '#3b82f6' },
      { name: 'Shipped', value: shipped, color: '#8b5cf6' },
      { name: 'Delivered', value: delivered, color: '#10b981' },
    ].filter(d => d.value > 0);
  }, [stats, recentOrders]);

  const topProductsChartData = useMemo(() =>
    topProducts.slice(0, 5).map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
      sales: p.sales,
      stock: p.stock,
    })), [topProducts]);

  const totalOrdersForPie = orderStatusData.reduce((s, d) => s + d.value, 0);
  const fulfillmentRate = stats?.totalOrders ? Math.round(((stats?.deliveredOrders ?? 0) / stats.totalOrders) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
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
    <div className="space-y-6">
      {/* Store Header */}
      <div className="px-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {user?.shopName || "My Shop"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {sellerFullName}.
        </p>
      </div>

      {/* Analytics Row: Revenue Chart + Order Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Revenue Analytics</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Daily revenue for the past week</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-foreground">{fmt(totalWeeklyRevenue)}</p>
                <p className="text-[11px] font-semibold text-emerald-600">This week</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', fontSize: '13px' }}
                    formatter={(value: number) => [fmt(value), 'Revenue']}
                    labelStyle={{ fontWeight: 700, marginBottom: 4, color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#revenueGradient)" dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Donut */}
        <Card className="glass-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Order Status</CardTitle>
            <p className="text-xs text-muted-foreground">Distribution of {totalOrdersForPie} orders</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '13px' }}
                    formatter={(value: number, name: string) => [`${value} orders`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {orderStatusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-bold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
            {/* Fulfillment Rate */}
            <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Fulfillment Rate</p>
                <p className={cn("text-sm font-extrabold", fulfillmentRate >= 50 ? 'text-emerald-600' : fulfillmentRate > 0 ? 'text-amber-600' : 'text-muted-foreground')}>{fulfillmentRate}%</p>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000",
                    fulfillmentRate >= 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : fulfillmentRate > 0 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : ''
                  )}
                  style={{ width: `${fulfillmentRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row 2: Top Products Bar Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Top Products
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Sales vs Stock levels</p>
              </div>
              <Link to="/seller/products" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {topProducts.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsChartData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', fontSize: '13px' }}
                      labelStyle={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="sales" name="Sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="stock" name="Stock" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No products yet</p>
                <Link to="/seller/products" className="text-xs text-blue-600 mt-2 hover:underline font-semibold">Add your first product</Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="glass-card">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest customer purchases</p>
              </div>
              <Link to="/seller/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => {
                const statusKey = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                const buyerName = order.buyer?.name || (order.buyer?.firstName ? `${order.buyer.firstName} ${order.buyer.lastName || ''}`.trim() : 'Unknown');
                return (
                  <div key={order._id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0 group hover:bg-muted/20 rounded-lg px-2 -mx-2 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-sm font-bold text-white">{buyerName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{buyerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.items[0]?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{fmt(order.totalAmount)}</p>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", statusColors[statusKey] || statusColors.Pending)}>
                        {statusIcons[statusKey]} {statusKey}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Attention */}
      {recentOrders.filter(o => o.status.toLowerCase() === 'pending').length > 0 && (
        <Card className="glass-card border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg font-bold">Needs Attention</CardTitle>
                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md">
                  {recentOrders.filter(o => o.status.toLowerCase() === 'pending').length}
                </span>
              </div>
              <Link to="/seller/orders" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.filter(o => o.status.toLowerCase() === 'pending').slice(0, 3).map((order) => {
              const buyerName = order.buyer?.name || (order.buyer?.firstName ? `${order.buyer.firstName} ${order.buyer.lastName || ''}`.trim() : 'Unknown');
              return (
                <Link
                  key={order._id}
                  to="/seller/orders"
                  className="flex items-center gap-4 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-sm font-bold text-white">{buyerName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{buyerName}</p>
                    <p className="text-xs text-muted-foreground">{order.items[0]?.name || 'N/A'} — {fmt(order.totalAmount)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1", statusColors.Pending)}>
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
