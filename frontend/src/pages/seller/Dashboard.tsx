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

// ─── Mock Data ──────────────────────────────────────────────────────────────
const stats = [
  { title: "Total Products", value: "48", change: "+3 this week", trend: "up" as const, icon: Package, color: "text-blue-600", bg: "bg-blue-600/10" },
  { title: "Total Orders", value: "156", change: "+12.3%", trend: "up" as const, icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-600/10" },
  { title: "Revenue", value: "LKR 284,500", change: "+18.2%", trend: "up" as const, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-600/10" },
  { title: "Avg. Rating", value: "4.6", change: "+0.2", trend: "up" as const, icon: Star, color: "text-purple-600", bg: "bg-purple-600/10" },
];

const recentOrders = [
  { id: "#FM-2041", buyer: "Kamal Perera", product: "Brake Pad Set - Toyota", amount: "LKR 4,500", status: "Pending", date: "2h ago" },
  { id: "#FM-2040", buyer: "Nimal Silva", product: "Oil Filter - Honda", amount: "LKR 1,200", status: "Shipped", date: "5h ago" },
  { id: "#FM-2039", buyer: "Ruwan Fernando", product: "Headlight Assembly", amount: "LKR 12,800", status: "Delivered", date: "1d ago" },
  { id: "#FM-2038", buyer: "Saman Kumara", product: "Spark Plugs Set (4)", amount: "LKR 3,200", status: "Processing", date: "1d ago" },
  { id: "#FM-2037", buyer: "Ajith Bandara", product: "Air Filter - Suzuki", amount: "LKR 1,800", status: "Delivered", date: "2d ago" },
];

const topProducts = [
  { name: "Brake Pad Set - Toyota", category: "Brakes", sales: 42, revenue: 189000, stock: 15 },
  { name: "Oil Filter - Honda", category: "Engine Parts", sales: 38, revenue: 45600, stock: 52 },
  { name: "Headlight Assembly", category: "Electrical", sales: 24, revenue: 307200, stock: 8 },
  { name: "Spark Plugs Set", category: "Engine Parts", sales: 35, revenue: 112000, stock: 30 },
];

const weeklySales = [
  { day: "Mon", amount: 32500 },
  { day: "Tue", amount: 28400 },
  { day: "Wed", amount: 45200 },
  { day: "Thu", amount: 38900 },
  { day: "Fri", amount: 52100 },
  { day: "Sat", amount: 61800 },
  { day: "Sun", amount: 25600 },
];

const orderStatusSummary = [
  { label: "Pending", count: 8, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { label: "Shipped", count: 12, icon: Truck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Delivered", count: 128, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Cancelled", count: 3, icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
];

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.firstName || "Seller"}! 👋
              </h1>
              <p className="text-blue-100 mt-1">
                Here's what's happening with your shop today.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
              <span className="text-lg">🏪</span>
              <span className="font-medium">{user?.shopName || "My Shop"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card-hover glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {orderStatusSummary.map((item) => (
          <div key={item.label} className={`flex items-center gap-3 rounded-lg border p-4 ${item.bg}`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
            <div>
              <p className="text-xl font-bold">{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Sales Chart */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Weekly Sales</CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">This Week</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-[220px] pt-4">
              {weeklySales.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {(item.amount / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-blue-500/80 hover:bg-blue-600 transition-colors duration-200 min-h-[8px]"
                      style={{ height: `${(item.amount / maxSale) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">LKR {(product.revenue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Link to="/seller/orders" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="h-3 w-3" />
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono font-medium text-blue-600">{order.id}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{order.buyer.charAt(0)}</span>
                        </div>
                        <span className="hidden sm:inline">{order.buyer}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">{order.product}</td>
                    <td className="py-3 font-semibold">{order.amount}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/seller/products">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Manage Products</p>
                <p className="text-xs text-muted-foreground">Add, edit or remove listings</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/seller/ai-chat">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Get smart sales insights</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/seller/reviews">
          <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center group-hover:bg-amber-600/20 transition-colors">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">View Reviews</p>
                <p className="text-xs text-muted-foreground">Check customer feedback</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
