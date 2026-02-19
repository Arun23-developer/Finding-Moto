import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Store,
} from "lucide-react";

const recentOrders = [
  { id: "#FM-1024", customer: "Ahmed Garage", amount: "$342", status: "Delivered", date: "2h ago" },
  { id: "#FM-1023", customer: "Quick Fix Motors", amount: "$128", status: "Shipped", date: "4h ago" },
  { id: "#FM-1022", customer: "Ali Auto Parts", amount: "$567", status: "Processing", date: "6h ago" },
  { id: "#FM-1021", customer: "Speed Mechanics", amount: "$89", status: "Pending", date: "8h ago" },
  { id: "#FM-1020", customer: "Pro Garage", amount: "$445", status: "Delivered", date: "12h ago" },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-success/15 text-success border-success/20",
  Shipped: "bg-info/15 text-info border-info/20",
  Processing: "bg-warning/15 text-warning border-warning/20",
  Pending: "bg-muted text-muted-foreground border-border",
};

const stats = [
  { title: "Total Revenue", value: "$52,400", change: "+12.5%", trend: "up" as const, icon: DollarSign },
  { title: "Total Orders", value: "1,315", change: "+8.2%", trend: "up" as const, icon: ShoppingCart },
  { title: "Active Shops", value: "248", change: "+15.3%", trend: "up" as const, icon: Store },
  { title: "Products Listed", value: "3,847", change: "-2.1%", trend: "down" as const, icon: Package },
];

const categoryData = [
  { name: "Engine Parts", value: 35, color: "hsl(25, 95%, 53%)" },
  { name: "Brakes", value: 25, color: "hsl(217, 91%, 60%)" },
  { name: "Electrical", value: 20, color: "hsl(142, 71%, 45%)" },
  { name: "Body Parts", value: 12, color: "hsl(280, 65%, 60%)" },
  { name: "Services", value: 8, color: "hsl(38, 92%, 50%)" },
];

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 7200 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 8400 },
  { month: "Jun", revenue: 9200 },
  { month: "Jul", revenue: 10800 },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card-hover glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart - Simple Bar */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-[250px] pt-4">
              {revenueData.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors duration-200 min-h-[8px]"
                      style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Donut */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* Simple progress bars for categories */}
            <div className="w-full space-y-3 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
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
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
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
                  <th className="text-left py-3 font-medium">Shop</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-mono font-medium text-primary">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
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
    </div>
  );
}
