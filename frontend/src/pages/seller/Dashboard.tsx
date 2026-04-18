import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Box,
  Clock3,
  Loader2,
  PackageSearch,
  RefreshCw,
  ShoppingCart,
  Star,
  TrendingUp,
  Wallet,
  Eye,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardFilter = "monthly" | "weekly";

interface SellerDashboardData {
  filter: DashboardFilter;
  kpis: {
    totalRevenue: number;
    ordersThisMonth: number;
    ordersThisMonthAmount: number;
    pendingOrders: number;
    avgOrderValue: number;
    completionRate: number;
    revenueGrowth: number;
  };
  revenueSeries: Array<{
    date: string;
    revenue: number;
  }>;
  ordersThisMonth: Array<{
    orderId: string;
    customerName: string;
    productName: string;
    orderAmount: number;
    orderDate: string;
    orderStatus: string;
  }>;
  pendingOrders: Array<{
    orderId: string;
    customerName: string;
    productName: string;
    orderAmount: number;
    orderDate: string;
    orderStatus: string;
  }>;
  returnOrders: Array<{
    orderId: string;
    productName: string;
    customerName: string;
    returnReason: string;
    returnDate: string;
    refundAmount: number;
  }>;
  monthlyReviews: Array<{
    customerName: string;
    productName: string;
    rating: number;
    review: string;
    reviewDate: string;
  }>;
  lowStockAlerts: Array<{
    productName: string;
    currentQuantity: number;
    minimumRequiredQuantity: number;
  }>;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenueGenerated: number;
  }>;
}

// ─── Formatters ───────────────────────────────────────────────────────────

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);
const formatPercent = (value: number) => `${percentFormatter.format(value || 0)}%`;
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
};
const formatShortDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : shortDateFormatter.format(date);
};
const getOrderLabel = (orderId: string) => `#${orderId.slice(-6).toUpperCase()}`;

// ─── Status Badge Classes ───────────────────────────────────────────────────

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "accepted":
      return "border-sky-200 bg-sky-50 text-sky-700 font-medium";
    case "confirmed":
      return "border-blue-200 bg-blue-50 text-blue-700 font-medium";
    case "processing":
      return "border-violet-200 bg-violet-50 text-violet-700 font-medium";
    case "shipped":
      return "border-cyan-200 bg-cyan-50 text-cyan-700 font-medium";
    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700 font-medium";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 font-medium";
  }
}

// ─── KPI Card Component ──────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  change?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, hint, icon: Icon, tone, change }) => (
  <Card className="glass-card overflow-hidden border border-border/40 shadow-sm transition-all hover:shadow-md hover:border-border/60">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2.5 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
          {change !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone} flex-shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Dashboard Table Component ────────────────────────────────────────────────

interface DashboardTableProps {
  title: string;
  description: string;
  columns: string[];
  rows: ReactNode[][];
  emptyTitle: string;
  emptyDescription: string;
}

function DashboardTable({
  title,
  description,
  columns,
  rows,
  emptyTitle,
  emptyDescription,
}: DashboardTableProps) {
  return (
    <Card className="glass-card border border-border/40">
      <CardHeader className="pb-4 border-b border-border/30">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-sm text-foreground">{emptyTitle}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">{emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/30 text-left">
                  {columns.map((column) => (
                    <th key={column} className="px-4 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/20 hover:bg-muted/25 transition-colors align-top last:border-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

const SkeletonKPI = () => (
  <Card className="glass-card">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-muted rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-12 w-12 bg-muted rounded-lg animate-pulse flex-shrink-0"></div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function SellerDashboard() {
  const [filter, setFilter] = useState<DashboardFilter>("monthly");
  const [dashboard, setDashboard] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (selectedFilter: DashboardFilter, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const { data } = await api.get("/seller/dashboard", {
        params: { range: selectedFilter },
      });

      if (data?.success) {
        setDashboard(data.data);
      } else {
        setError("Failed to load seller dashboard.");
      }
    } catch {
      setError("Failed to load seller dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(filter);
  }, [fetchDashboard, filter]);

  const summaryCards = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(dashboard.kpis.totalRevenue),
        hint: "All completed orders",
        icon: Wallet,
        tone: "bg-emerald-500/15 text-emerald-600",
      },
      {
        title: "Orders This Month",
        value: `${dashboard.kpis.ordersThisMonth}`,
        hint: formatCurrency(dashboard.kpis.ordersThisMonthAmount),
        icon: ShoppingCart,
        tone: "bg-blue-500/15 text-blue-600",
      },
      {
        title: "Pending Orders",
        value: `${dashboard.kpis.pendingOrders}`,
        hint: "Awaiting shipment",
        icon: Clock3,
        tone: "bg-amber-500/15 text-amber-600",
      },
      {
        title: "Avg Order Value",
        value: formatCurrency(dashboard.kpis.avgOrderValue),
        hint: "Per completed order",
        icon: TrendingUp,
        tone: "bg-violet-500/15 text-violet-600",
      },
      {
        title: "Completion Rate",
        value: formatPercent(dashboard.kpis.completionRate),
        hint: "Shipped or delivered",
        icon: Box,
        tone: "bg-cyan-500/15 text-cyan-600",
      },
      {
        title: "Revenue Growth",
        value: formatPercent(dashboard.kpis.revenueGrowth),
        hint: "vs previous month",
        icon: dashboard.kpis.revenueGrowth >= 0 ? ArrowUpRight : ArrowDownRight,
        tone: dashboard.kpis.revenueGrowth >= 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600",
      },
    ];
  }, [dashboard]);

  const topSellingChartData = useMemo(
    () =>
      (dashboard?.topSellingProducts || []).slice(0, 10).map((product) => ({
        name: product.productName.length > 18 ? `${product.productName.slice(0, 18)}...` : product.productName,
        units: product.unitsSold,
        revenue: Math.round(product.revenueGenerated),
      })),
    [dashboard]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-12 w-48 bg-muted rounded animate-pulse"></div>
        
        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonKPI key={i} />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="h-80 w-full bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-red-500/10 p-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <p className="font-semibold text-foreground text-lg">{error || "Failed to load dashboard"}</p>
        <p className="text-muted-foreground text-sm mt-1">Please check your connection and try again.</p>
        <Button
          onClick={() => fetchDashboard(filter, true)}
          className="mt-6 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analytics and order monitoring for {filter === "monthly" ? "this month" : "this week"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border/40 bg-muted/50 p-1.5">
            {(["monthly", "weekly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  filter === option
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "monthly" ? "Monthly" : "Weekly"}
              </button>
            ))}
          </div>

          <Button
            onClick={() => fetchDashboard(filter, true)}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      {/* Revenue Chart and Side Panel */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        {/* Monthly Revenue Chart */}
        <Card className="glass-card border border-border/40">
          <CardHeader className="pb-4 border-b border-border/30">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-lg font-semibold">Monthly Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily completed revenue for the {filter === "monthly" ? "current month" : "last 7 days"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 rounded-lg border border-emerald-200/40 bg-emerald-50/30 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Total Revenue</p>
              <p className="mt-1.5 text-3xl font-bold text-emerald-700">
                {formatCurrency(dashboard.kpis.totalRevenue)}
              </p>
            </div>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.revenueSeries} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    tick={{ fontSize: 12, fill: "rgb(107, 114, 128)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                    tick={{ fontSize: 12, fill: "rgb(107, 114, 128)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(label) => formatDate(label)}
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(75, 85, 99, 0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#2563eb" }}
                    activeDot={{ r: 6, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel with KPIs */}
        <div className="space-y-6">
          {/* Revenue Comparison Card */}
          <Card className="glass-card border border-border/40">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Current vs previous period performance</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Revenue Growth */}
              <div className="rounded-lg border border-border/40 bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Revenue Growth</p>
                  {dashboard.kpis.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p
                  className={`text-3xl font-bold ${
                    dashboard.kpis.revenueGrowth >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatPercent(dashboard.kpis.revenueGrowth)}
                </p>
              </div>

              {/* AOV and Completion Rate Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/40 bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">AOV</p>
                  <p className="mt-2 text-2xl font-bold text-violet-600">
                    {formatCurrency(dashboard.kpis.avgOrderValue)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Completion</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-600">
                    {formatPercent(dashboard.kpis.completionRate)}
                  </p>
                </div>
              </div>

              {/* Completion Rate Progress */}
              <div className="rounded-lg border border-border/40 bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Operational Success</span>
                  <span className="font-semibold text-cyan-600">{formatPercent(dashboard.kpis.completionRate)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500"
                    style={{ width: `${Math.min(dashboard.kpis.completionRate, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products Bar Chart */}
          <Card className="glass-card border border-border/40">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-base font-semibold">Top Sellers</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Top 10 products by units sold</p>
            </CardHeader>
            <CardContent className="pt-6">
              {topSellingChartData.length === 0 ? (
                <div className="rounded-lg border border-border/40 bg-muted/30 px-4 py-12 text-center">
                  <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgb(107, 114, 128)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "rgb(107, 114, 128)" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value: number) => [value, "Units"]}
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.95)",
                          border: "1px solid rgba(75, 85, 99, 0.3)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="units" fill="#0f766e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Table */}
      <DashboardTable
        title="Orders This Month"
        description={`All orders placed during this ${filter === "monthly" ? "month" : "week"}`}
        columns={["Order ID", "Customer", "Product", "Amount", "Date", "Status"]}
        rows={dashboard.ordersThisMonth.map((order) => [
          <span className="font-mono font-semibold text-blue-600">{getOrderLabel(order.orderId)}</span>,
          <span className="font-medium text-sm">{order.customerName}</span>,
          <span className="text-sm truncate">{order.productName}</span>,
          <span className="font-semibold">{formatCurrency(order.orderAmount)}</span>,
          <span className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</span>,
          <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClasses(order.orderStatus)}`}>
            {order.orderStatus}
          </span>,
        ])}
        emptyTitle="No orders"
        emptyDescription="Orders placed during this period will appear here"
      />

      {/* Pending Orders */}
      <DashboardTable
        title="Pending Orders"
        description="Orders confirmed but not yet shipped — prioritize these for fulfillment"
        columns={["Order ID", "Customer", "Product", "Amount", "Date", "Status"]}
        rows={dashboard.pendingOrders.map((order) => [
          <span className="font-mono font-semibold text-amber-600">{getOrderLabel(order.orderId)}</span>,
          <span className="font-medium text-sm">{order.customerName}</span>,
          <span className="text-sm truncate">{order.productName}</span>,
          <span className="font-semibold">{formatCurrency(order.orderAmount)}</span>,
          <span className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</span>,
          <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClasses(order.orderStatus)}`}>
            {order.orderStatus}
          </span>,
        ])}
        emptyTitle="All caught up!"
        emptyDescription="No pending orders waiting for shipment"
      />

      {/* Returns and Reviews Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Return Orders */}
        <DashboardTable
          title="Return Orders (This Month)"
          description="Cancelled and refunded orders requiring attention"
          columns={["Order ID", "Product", "Customer", "Reason", "Refund", "Date"]}
          rows={dashboard.returnOrders.map((order) => [
            <span className="font-mono font-semibold text-red-600">{getOrderLabel(order.orderId)}</span>,
            <span className="text-sm font-medium truncate">{order.productName}</span>,
            <span className="text-sm">{order.customerName}</span>,
            <span className="text-xs text-muted-foreground max-w-[200px] truncate">{order.returnReason}</span>,
            <span className="font-semibold text-red-600">{formatCurrency(order.refundAmount)}</span>,
            <span className="text-sm text-muted-foreground">{formatDate(order.returnDate)}</span>,
          ])}
          emptyTitle="No returns"
          emptyDescription="Cancelled orders will appear here"
        />

        {/* Customer Reviews */}
        <DashboardTable
          title="Customer Reviews"
          description="Product feedback from customers this month"
          columns={["Customer", "Product", "Rating", "Review", "Date"]}
          rows={dashboard.monthlyReviews.map((review) => [
            <span className="text-sm font-medium">{review.customerName}</span>,
            <span className="text-sm truncate">{review.productName}</span>,
            <span className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
              <span className="ml-1 font-semibold text-sm text-amber-600">{review.rating}</span>
            </span>,
            <span className="text-xs text-muted-foreground max-w-[250px] truncate">{review.review}</span>,
            <span className="text-sm text-muted-foreground">{formatDate(review.reviewDate)}</span>,
          ])}
          emptyTitle="No reviews"
          emptyDescription="Customer feedback will appear here"
        />
      </div>

      {/* Low Stock and Top Products */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Low Stock Alerts */}
        <Card className="glass-card border border-border/40">
          <CardHeader className="pb-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Low Stock Alert</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Products below minimum threshold</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {dashboard.lowStockAlerts.length === 0 ? (
              <div className="rounded-lg border border-emerald-200/40 bg-emerald-50/30 px-4 py-8 text-center">
                <div className="flex justify-center mb-2">
                  <Box className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-700">All products in stock</p>
              </div>
            ) : (
              dashboard.lowStockAlerts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-red-200/40 bg-red-50/30 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{product.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Min: {product.minimumRequiredQuantity}</p>
                  </div>
                  <span className="flex-shrink-0 rounded-lg bg-red-500/10 px-3 py-1 text-sm font-bold text-red-600">
                    {product.currentQuantity}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products Table */}
        <DashboardTable
          title="Top Selling Products"
          description="Best performers ranked by units sold"
          columns={["Product", "Units Sold", "Revenue"]}
          rows={dashboard.topSellingProducts.map((product) => [
            <span className="font-medium text-sm">{product.productName}</span>,
            <span className="font-semibold text-center">{product.unitsSold}</span>,
            <span className="font-semibold text-emerald-600">{formatCurrency(product.revenueGenerated)}</span>,
          ])}
          emptyTitle="No sales data"
          emptyDescription="Top products will appear as orders are completed"
        />
      </div>

      {/* Footer Summary Card */}
      <Card className="glass-card border border-border/40 bg-gradient-to-br from-slate-50/50 to-blue-50/30">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">Performance Overview</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Dashboard updated with real-time seller data
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border/30 bg-white/50 px-4 py-3">
              <p className="text-xs text-muted-foreground font-medium">Revenue</p>
              <p className="mt-1.5 font-bold text-emerald-600">{formatCurrency(dashboard.kpis.totalRevenue)}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-white/50 px-4 py-3">
              <p className="text-xs text-muted-foreground font-medium">Orders</p>
              <p className="mt-1.5 font-bold text-blue-600">{dashboard.kpis.ordersThisMonth}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-white/50 px-4 py-3">
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
              <p className="mt-1.5 font-bold text-amber-600">{dashboard.kpis.pendingOrders}</p>
            </div>
            <div className="rounded-lg border border-border/30 bg-white/50 px-4 py-3">
              <p className="text-xs text-muted-foreground font-medium">Growth</p>
              <p className={`mt-1.5 font-bold ${dashboard.kpis.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatPercent(dashboard.kpis.revenueGrowth)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
