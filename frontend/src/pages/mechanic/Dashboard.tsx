import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  BarChart3,
  Package,
  RefreshCw,
  Search,
  ImageIcon,
  Edit3,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/imageUrl";
import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface ServiceRequest {
  id: string;
  customer: string;
  vehicle: string;
  issue: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  amount: number;
}

const fmt = (n: number) => `LKR ${n.toLocaleString()}`;

interface WeeklyServiceStat {
  day: string;
  jobs: number;
  revenue: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  accepted: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  in_progress: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
};

const statusLabels: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  accepted: <CheckCircle className="h-3 w-3" />,
  in_progress: <Activity className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <span className="h-3 w-3">✕</span>,
};

interface DashboardService {
  _id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  status: "active" | "inactive" | "out_of_stock";
  views: number;
  sales: number;
  sku: string;
  createdAt: string;
}

interface ServiceCategoryData {
  category: string;
  services: number;
  avgPrice: number;
}

const productStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" },
  out_of_stock: { label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800" },
};

const categoryIcons: Record<string, string> = {
  General: '🔧',
  Engine: '⚙️',
  Brakes: '🛑',
  Electrical: '⚡',
  Tyres: '🛞',
  Transmission: '🔗',
  Suspension: '🏍️',
};

const statusDonutColors: Record<ServiceRequest['status'], string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

// ─── Dashboard Overview ─────────────────────────────────────────────────────
const productCategories = ["All", "Bikes", "Brakes", "Lubricants", "Engine Parts", "Drive", "Filters", "Cables", "Electrical", "Accessories"];

export default function MechanicDashboard() {
  const { user } = useAuth();
  const [dashServices, setDashServices] = useState<DashboardService[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    Promise.all([api.get('/mechanic/services'), api.get('/orders'), api.get('/products')])
      .then(([servicesRes, ordersRes, productsRes]) => {
        if (servicesRes.data.success) {
          setDashServices(servicesRes.data.data.filter((s: DashboardService) => s.active).slice(0, 6));
        }

        const rawOrders = ordersRes.data?.data || [];
        const mappedRequests: ServiceRequest[] = rawOrders.map((order: any) => {
          const buyer = typeof order.buyer === 'string'
            ? order.buyer
            : (order.buyer?.name || `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim() || 'Customer');

          const backendStatus = String(order.status || '').toLowerCase();
          const statusMap: Record<string, ServiceRequest['status']> = {
            pending: 'pending',
            confirmed: 'accepted',
            shipped: 'in_progress',
            delivered: 'completed',
            cancelled: 'cancelled',
          };

          return {
            id: order._id,
            customer: buyer,
            vehicle: 'Service Request',
            issue: order.items?.[0]?.name || 'General service',
            status: statusMap[backendStatus] || 'pending',
            date: order.createdAt || new Date().toISOString(),
            amount: Number(order.totalAmount || 0),
          };
        });

        setServiceRequests(mappedRequests);

        if (productsRes.data.success) {
          setProducts(productsRes.data.data || []);
        }
      })
      .catch(() => {
        setDashServices([]);
        setServiceRequests([]);
        setProducts([]);
      });
  }, []);

  const completedJobs = serviceRequests.filter((r) => r.status === 'completed').length;

  const weeklyStats = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days: { key: string; day: string; jobs: number; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ key, day: dayNames[d.getDay()], jobs: 0, revenue: 0 });
    }

    for (const req of serviceRequests) {
      const dayKey = new Date(req.date).toISOString().split('T')[0];
      const target = days.find((d) => d.key === dayKey);
      if (target) {
        target.jobs += 1;
        target.revenue += req.amount;
      }
    }

    return days.map((d): WeeklyServiceStat => ({ day: d.day, jobs: d.jobs, revenue: d.revenue }));
  }, [serviceRequests]);

  const requestStatusData = useMemo(
    () => {
      const counts: Record<ServiceRequest['status'], number> = {
        pending: 0,
        accepted: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      };

      for (const req of serviceRequests) {
        counts[req.status] += 1;
      }

      return (Object.keys(counts) as ServiceRequest['status'][])
        .map((status) => ({
          name: statusLabels[status],
          value: counts[status],
          color: statusDonutColors[status],
        }))
        .filter((d) => d.value > 0);
    },
    [serviceRequests]
  );

  const serviceCategoryData = useMemo(() => {
    const map = new Map<string, { total: number; priceSum: number }>();
    for (const svc of dashServices) {
      const prev = map.get(svc.category) || { total: 0, priceSum: 0 };
      map.set(svc.category, {
        total: prev.total + 1,
        priceSum: prev.priceSum + svc.price,
      });
    }

    return Array.from(map.entries())
      .map(([category, data]): ServiceCategoryData => ({
        category: category.length > 14 ? `${category.slice(0, 14)}…` : category,
        services: data.total,
        avgPrice: Math.round(data.priceSum / data.total),
      }))
      .slice(0, 6);
  }, [dashServices]);

  const totalWeeklyRevenue = weeklyStats.reduce((sum, day) => sum + day.revenue, 0);
  const totalRequestsForPie = requestStatusData.reduce((sum, d) => sum + d.value, 0);
  const completionRate = serviceRequests.length > 0 ? Math.round((completedJobs / serviceRequests.length) * 100) : 0;
  const attentionItems = serviceRequests.filter((r) => r.status === 'pending' || r.status === 'accepted');
  const inProgressJobs = serviceRequests.filter((r) => r.status === 'in_progress').length;
  const hasWeeklyRevenueData = weeklyStats.some((day) => day.jobs > 0 || day.revenue > 0);
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const mechanicName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.firstName || 'Mechanic';
  const workshopLabel = (user as any)?.workshopName || (user as any)?.specialization || 'My Workshop';

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {workshopLabel}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {mechanicName}.
        </p>
      </div>

      {/* Analytics Row: Weekly Revenue + Request Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Weekly Revenue</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Estimated revenue from service jobs</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-foreground">{fmt(totalWeeklyRevenue)}</p>
                <p className="text-[11px] font-semibold text-emerald-600">This week</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              {hasWeeklyRevenueData ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                  <AreaChart data={weeklyStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mechanicRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.42} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                        fontSize: '13px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? fmt(value) : `${value} jobs`,
                        name === 'revenue' ? 'Revenue' : 'Jobs',
                      ]}
                      labelStyle={{ fontWeight: 700, marginBottom: 4, color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fill="url(#mechanicRevenueGradient)" dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#f97316', strokeWidth: 3, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No weekly revenue yet</p>
                  <p className="text-xs text-muted-foreground">Revenue will appear here after service orders come in.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Request Status</CardTitle>
            <p className="text-xs text-muted-foreground">Distribution of {totalRequestsForPie} requests</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              {requestStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                  <PieChart>
                    <Pie
                      data={requestStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {requestStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '13px' }}
                      formatter={(value: number, name: string) => [`${value} requests`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <RefreshCw className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No request status data yet</p>
                  <p className="text-xs text-muted-foreground">Request analytics will appear once orders are created.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {requestStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-bold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Completion Rate</p>
                <p className={cn("text-sm font-extrabold", completionRate >= 50 ? 'text-emerald-600' : completionRate > 0 ? 'text-amber-600' : 'text-muted-foreground')}>
                  {completionRate}%
                </p>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    completionRate >= 50
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : completionRate > 0
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : ''
                  )}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row 2: Services + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Service Categories
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Service count vs average price</p>
              </div>
              <Link to="/mechanic/services" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                Manage <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {serviceCategoryData.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={serviceCategoryData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', fontSize: '13px' }}
                      formatter={(value: number, name: string) => [
                        name === 'services' ? `${value} services` : fmt(value),
                        name === 'services' ? 'Services' : 'Avg Price',
                      ]}
                      labelStyle={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="services" name="Services" fill="#f97316" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avgPrice" name="Avg Price" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No services yet</p>
                <Link to="/mechanic/services" className="text-xs text-amber-600 mt-2 hover:underline font-semibold">Add your first service</Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Recent Requests</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest customer service requests</p>
              </div>
              <Link to="/mechanic/orders" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {serviceRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0 group hover:bg-muted/20 rounded-lg px-2 -mx-2 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-sm font-bold text-white">{req.customer.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{req.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.vehicle} · {req.issue}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{fmt(req.amount)}</p>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", statusColors[req.status])}>
                      {statusIcons[req.status]} {statusLabels[req.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Attention */}
      {attentionItems.length > 0 && (
        <Card className="glass-card border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg font-bold">Needs Attention</CardTitle>
                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md">
                  {attentionItems.length}
                </span>
              </div>
              <Link to="/mechanic/orders" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {attentionItems.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to="/mechanic/orders"
                className="flex items-center gap-4 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-sm font-bold text-white">{item.customer.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{item.customer}</p>
                  <p className="text-xs text-muted-foreground">{item.issue} - {fmt(item.amount)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1", statusColors[item.status])}>
                    {statusIcons[item.status]} {statusLabels[item.status]}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
