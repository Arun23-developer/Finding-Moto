import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Box,
  Eye,
  PackageSearch,
  RefreshCw,
  Star,
  Wrench,
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
} from "recharts";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

type DashboardTab = "product" | "service";

interface DashboardKpis {
  totalRevenue: number;
  ordersThisMonth: number;
  ordersThisMonthAmount: number;
  pendingOrders: number;
  avgOrderValue: number;
  completionRate: number;
  revenueGrowth: number;
}

interface DashboardRow {
  orderId?: string;
  reviewId?: string;
  customerName: string;
  itemName: string;
  orderAmount?: number;
  orderDate?: string;
  orderStatus?: string;
  rating?: number;
  review?: string;
  reviewDate?: string;
  reason?: string;
  actionDate?: string;
  amount?: number;
}

interface LowStockAlert {
  itemName: string;
  currentQuantity: number;
  minimumRequiredQuantity: number;
}

interface TopSellingItem {
  itemId: string;
  itemName: string;
  unitsSold: number;
  revenueGenerated: number;
}

interface MechanicDashboardData {
  type: DashboardTab;
  hasData: boolean;
  emptyMessage: string;
  kpis: DashboardKpis;
  revenueSeries: Array<{ date: string; revenue: number }>;
  ordersThisMonth: DashboardRow[];
  pendingOrders: DashboardRow[];
  returnOrders: DashboardRow[];
  monthlyReviews: DashboardRow[];
  lowStockAlerts: LowStockAlert[];
  topSellingItems: TopSellingItem[];
}

interface DashboardTableProps {
  title: string;
  description: string;
  columns: string[];
  rows: ReactNode[][];
  emptyTitle: string;
  emptyDescription: string;
}

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

const platinum = {
  background: "#F5F6F7",
  card: "#F5F6F7",
  muted: "#7B7F85",
  primary: "#2B2E33",
  border: "#A7ABB0",
};

const emptyKpis: DashboardKpis = {
  totalRevenue: 0,
  ordersThisMonth: 0,
  ordersThisMonthAmount: 0,
  pendingOrders: 0,
  avgOrderValue: 0,
  completionRate: 0,
  revenueGrowth: 0,
};

const emptyDashboardData = (type: DashboardTab): MechanicDashboardData => ({
  type,
  hasData: false,
  emptyMessage: type === "product" ? "No product data available" : "No service data available",
  kpis: emptyKpis,
  revenueSeries: [],
  ordersThisMonth: [],
  pendingOrders: [],
  returnOrders: [],
  monthlyReviews: [],
  lowStockAlerts: [],
  topSellingItems: [],
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);
const formatPercent = (value: number) => `${percentFormatter.format(value || 0)}%`;
const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
};
const formatShortDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : shortDateFormatter.format(date);
};
const getOrderLabel = (orderId?: string) => (orderId ? `#${orderId.slice(-6).toUpperCase()}` : "-");

function DashboardTable({
  title,
  description,
  columns,
  rows,
  emptyTitle,
  emptyDescription,
}: DashboardTableProps) {
  return (
    <Card
      className="border shadow-sm"
      style={{ backgroundColor: platinum.card, borderColor: platinum.border, color: platinum.primary }}
    >
      <CardHeader className="border-b pb-4" style={{ borderColor: platinum.border }}>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <p className="mt-1 text-sm" style={{ color: platinum.muted }}>{description}</p>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8" style={{ color: platinum.muted, opacity: 0.5 }} />
            <p className="text-sm font-medium" style={{ color: platinum.primary }}>{emptyTitle}</p>
            <p className="mt-1.5 text-xs" style={{ color: platinum.muted }}>{emptyDescription}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr style={{ backgroundColor: "#D8DBDE" }}>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: platinum.muted }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t align-top" style={{ borderColor: platinum.border }}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">{cell}</td>
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

export default function MechanicDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("product");
  const [dashboardByTab, setDashboardByTab] = useState<Record<DashboardTab, MechanicDashboardData | null>>({
    product: null,
    service: null,
  });
  const [loadingByTab, setLoadingByTab] = useState<Record<DashboardTab, boolean>>({
    product: false,
    service: false,
  });
  const [errorByTab, setErrorByTab] = useState<Record<DashboardTab, string>>({
    product: "",
    service: "",
  });

  const fetchDashboard = useCallback(async (tab: DashboardTab, force = false) => {
    if (loadingByTab[tab]) return;
    if (!force && dashboardByTab[tab]) return;

    setLoadingByTab((prev) => ({ ...prev, [tab]: true }));
    setErrorByTab((prev) => ({ ...prev, [tab]: "" }));

    try {
      const { data } = await api.get("/mechanic/dashboard", { params: { type: tab } });

      if (data?.success) {
        setDashboardByTab((prev) => ({
          ...prev,
          [tab]: {
            ...emptyDashboardData(tab),
            ...data.data,
            revenueSeries: Array.isArray(data.data?.revenueSeries) ? data.data.revenueSeries : [],
            ordersThisMonth: Array.isArray(data.data?.ordersThisMonth) ? data.data.ordersThisMonth : [],
            pendingOrders: Array.isArray(data.data?.pendingOrders) ? data.data.pendingOrders : [],
            returnOrders: Array.isArray(data.data?.returnOrders) ? data.data.returnOrders : [],
            monthlyReviews: Array.isArray(data.data?.monthlyReviews) ? data.data.monthlyReviews : [],
            lowStockAlerts: Array.isArray(data.data?.lowStockAlerts) ? data.data.lowStockAlerts : [],
            topSellingItems: Array.isArray(data.data?.topSellingItems) ? data.data.topSellingItems : [],
            kpis: { ...emptyKpis, ...(data.data?.kpis || {}) },
          },
        }));
      } else {
        setErrorByTab((prev) => ({ ...prev, [tab]: "Failed to load data" }));
      }
    } catch {
      setErrorByTab((prev) => ({ ...prev, [tab]: "Failed to load data" }));
    } finally {
      setLoadingByTab((prev) => ({ ...prev, [tab]: false }));
    }
  }, [dashboardByTab, loadingByTab]);

  useEffect(() => {
    void fetchDashboard("product");
  }, [fetchDashboard]);

  useEffect(() => {
    void fetchDashboard(activeTab);
  }, [activeTab, fetchDashboard]);

  const dashboard = dashboardByTab[activeTab] || emptyDashboardData(activeTab);
  const loading = loadingByTab[activeTab];
  const error = errorByTab[activeTab];
  const topSellingChartData = useMemo(
    () =>
      dashboard.topSellingItems.slice(0, 10).map((item) => ({
        name: item.itemName.length > 18 ? `${item.itemName.slice(0, 18)}...` : item.itemName,
        units: item.unitsSold || 0,
        revenue: Math.round(item.revenueGenerated || 0),
      })),
    [dashboard.topSellingItems]
  );

  const workshopLabel =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    (user as { workshopName?: string } | null)?.workshopName ||
    "Mechanic Dashboard";
  const sectionItemLabel = activeTab === "product" ? "Product" : "Service";

  return (
    <div className="space-y-6 rounded-[28px] p-4 md:p-6" style={{ backgroundColor: platinum.background }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: platinum.primary }}>{workshopLabel}</h1>
          <p className="mt-1 text-sm" style={{ color: platinum.muted }}>
            Seller-style dashboard for products and services with isolated mechanic data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
            <TabsList className="h-auto rounded-xl border p-1.5" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
              <TabsTrigger
                value="product"
                className="rounded-lg px-4 py-2 text-sm data-[state=active]:shadow-none"
                style={{ color: activeTab === "product" ? "#FFFFFF" : platinum.primary, backgroundColor: activeTab === "product" ? platinum.primary : "transparent" }}
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="service"
                className="rounded-lg px-4 py-2 text-sm data-[state=active]:shadow-none"
                style={{ color: activeTab === "service" ? "#FFFFFF" : platinum.primary, backgroundColor: activeTab === "service" ? platinum.primary : "transparent" }}
              >
                Services
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={() => void fetchDashboard(activeTab, true)}
            disabled={loading}
            variant="outline"
            className="gap-2"
            style={{ borderColor: platinum.border, color: platinum.primary, backgroundColor: platinum.card }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border text-center" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
          <div className="mb-4 rounded-full p-3" style={{ backgroundColor: "rgba(220, 38, 38, 0.12)" }}>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-lg font-semibold" style={{ color: platinum.primary }}>Failed to load data</p>
          <p className="mt-1 text-sm" style={{ color: platinum.muted }}>Please try again.</p>
          <Button
            onClick={() => void fetchDashboard(activeTab, true)}
            className="mt-6"
            style={{ backgroundColor: platinum.primary, color: "#FFFFFF" }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {!dashboard.hasData && !loading && (
            <Card className="border shadow-sm" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
              <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                {activeTab === "product" ? (
                  <PackageSearch className="mb-3 h-10 w-10" style={{ color: platinum.muted, opacity: 0.6 }} />
                ) : (
                  <Wrench className="mb-3 h-10 w-10" style={{ color: platinum.muted, opacity: 0.6 }} />
                )}
                <p className="text-base font-semibold" style={{ color: platinum.primary }}>{dashboard.emptyMessage}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
            <Card className="border shadow-sm" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
              <CardHeader className="border-b pb-4" style={{ borderColor: platinum.border }}>
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-lg font-semibold" style={{ color: platinum.primary }}>Monthly Revenue Trend</CardTitle>
                  <p className="text-sm" style={{ color: platinum.muted }}>
                    Daily {sectionItemLabel.toLowerCase()} revenue for the current month with zero-filled missing days
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4 rounded-lg border px-4 py-3" style={{ borderColor: "#9DB8AB", backgroundColor: "rgba(34,197,94,0.08)" }}>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Total Revenue</p>
                  <p className="mt-1.5 text-3xl font-bold text-emerald-700">{formatCurrency(dashboard.kpis.totalRevenue)}</p>
                </div>
                <div className="h-[340px] w-full">
                  {loading && !dashboardByTab[activeTab] ? (
                    <div className="h-full animate-pulse rounded-xl" style={{ backgroundColor: "#D8DBDE" }} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboard.revenueSeries.length > 0 ? dashboard.revenueSeries : [{ date: new Date().toISOString(), revenue: 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,127,133,0.25)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatShortDate}
                          tick={{ fontSize: 12, fill: platinum.muted }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                          tick={{ fontSize: 12, fill: platinum.muted }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                          labelFormatter={(label) => formatDate(String(label))}
                          contentStyle={{
                            backgroundColor: platinum.primary,
                            border: `1px solid ${platinum.border}`,
                            borderRadius: "8px",
                            color: "#FFFFFF",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={platinum.primary}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: platinum.primary }}
                          activeDot={{ r: 6, fill: platinum.primary }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border shadow-sm" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
                <CardHeader className="border-b pb-4" style={{ borderColor: platinum.border }}>
                  <CardTitle className="text-base font-semibold" style={{ color: platinum.primary }}>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="rounded-lg border p-4" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.18)" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: platinum.primary }}>Operational Success</span>
                      <span className="font-semibold text-cyan-700">{formatPercent(dashboard.kpis.completionRate)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 transition-all duration-500"
                        style={{ width: `${Math.min(dashboard.kpis.completionRate || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border p-4" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.18)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: platinum.muted }}>Avg Order Value</p>
                        <p className="mt-2 text-2xl font-bold text-violet-700">{formatCurrency(dashboard.kpis.avgOrderValue)}</p>
                      </div>
                      <div className="text-right text-xs" style={{ color: platinum.muted }}>
                        <p>{activeTab === "product" ? "Orders this month" : "Bookings this month"}</p>
                        <p className="mt-1 font-medium" style={{ color: platinum.primary }}>{dashboard.kpis.ordersThisMonth}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
                <CardHeader className="border-b pb-4" style={{ borderColor: platinum.border }}>
                  <CardTitle className="text-base font-semibold" style={{ color: platinum.primary }}>
                    {activeTab === "product" ? "Top Selling Products" : "Top Providing Services"}
                  </CardTitle>
                  <p className="mt-1 text-sm" style={{ color: platinum.muted }}>
                    Top 10 {activeTab === "product" ? "products" : "services"} by completed volume
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  {topSellingChartData.length === 0 ? (
                    <div className="rounded-lg border px-4 py-12 text-center" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.12)" }}>
                      {activeTab === "product" ? (
                        <PackageSearch className="mx-auto mb-3 h-8 w-8" style={{ color: platinum.muted, opacity: 0.5 }} />
                      ) : (
                        <Wrench className="mx-auto mb-3 h-8 w-8" style={{ color: platinum.muted, opacity: 0.5 }} />
                      )}
                      <p className="text-sm" style={{ color: platinum.muted }}>
                        {dashboard.hasData ? "No data available" : dashboard.emptyMessage}
                      </p>
                    </div>
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topSellingChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,127,133,0.25)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: platinum.muted }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: platinum.muted }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(_value: number, _name: string, item: { payload?: { units: number; revenue: number } }) => {
                              if (!item?.payload) return null;
                              return [
                                <div className="space-y-1 py-1">
                                  <p className="text-xs text-slate-200">Units: {item.payload.units}</p>
                                  <p className="text-xs text-slate-200">Revenue: {formatCurrency(item.payload.revenue)}</p>
                                </div>,
                                "",
                              ];
                            }}
                            labelFormatter={() => ""}
                            contentStyle={{
                              backgroundColor: platinum.primary,
                              border: `1px solid ${platinum.border}`,
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="units" fill={activeTab === "product" ? "#0F766E" : "#2563EB"} radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DashboardTable
            title="Orders This Month"
            description={activeTab === "product" ? "Product orders placed this month" : "Service bookings created this month"}
            columns={["Order ID", "Customer", activeTab === "product" ? "Product" : "Service", "Amount", "Date", "Status"]}
            rows={dashboard.ordersThisMonth.map((order) => [
              <span className="font-mono font-semibold text-blue-700">{getOrderLabel(order.orderId)}</span>,
              <span className="text-sm font-medium" style={{ color: platinum.primary }}>{order.customerName}</span>,
              <span className="text-sm" style={{ color: platinum.primary }}>{order.itemName}</span>,
              <span className="font-semibold" style={{ color: platinum.primary }}>{formatCurrency(order.orderAmount || 0)}</span>,
              <span className="text-sm" style={{ color: platinum.muted }}>{formatDate(order.orderDate)}</span>,
              <span className="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: platinum.border, color: platinum.primary }}>
                {order.orderStatus}
              </span>,
            ])}
            emptyTitle={`No ${activeTab === "product" ? "product orders" : "service bookings"}`}
            emptyDescription={dashboard.emptyMessage || "New activity will appear here"}
          />

          <DashboardTable
            title="Pending Orders"
            description={activeTab === "product"
              ? "Product orders awaiting fulfillment"
              : "Service bookings still pending arrival or work start"}
            columns={["Order ID", "Customer", activeTab === "product" ? "Product" : "Service", "Amount", "Date", "Status"]}
            rows={dashboard.pendingOrders.map((order) => [
              <span className="font-mono font-semibold text-amber-700">{getOrderLabel(order.orderId)}</span>,
              <span className="text-sm font-medium" style={{ color: platinum.primary }}>{order.customerName}</span>,
              <span className="text-sm" style={{ color: platinum.primary }}>{order.itemName}</span>,
              <span className="font-semibold" style={{ color: platinum.primary }}>{formatCurrency(order.orderAmount || 0)}</span>,
              <span className="text-sm" style={{ color: platinum.muted }}>{formatDate(order.orderDate)}</span>,
              <span className="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: platinum.border, color: platinum.primary }}>
                {order.orderStatus}
              </span>,
            ])}
            emptyTitle={activeTab === "product" ? "All caught up" : "No pending service bookings"}
            emptyDescription={activeTab === "product" ? "No pending product orders waiting for action" : "No pre-service bookings waiting for action"}
          />

          <div className={`grid grid-cols-1 gap-6 ${activeTab === "product" ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}>
            {activeTab === "product" && (
              <DashboardTable
                title="Return Orders (This Month)"
                description="Product return and refund activity for the current month"
                columns={["Order ID", "Product", "Customer", "Reason", "Refund", "Date"]}
                rows={dashboard.returnOrders.map((order) => [
                  <span className="font-mono font-semibold text-red-700">{getOrderLabel(order.orderId)}</span>,
                  <span className="text-sm font-medium" style={{ color: platinum.primary }}>{order.itemName}</span>,
                  <span className="text-sm" style={{ color: platinum.primary }}>{order.customerName}</span>,
                  <span className="max-w-[200px] truncate text-xs" style={{ color: platinum.muted }}>{order.reason || "-"}</span>,
                  <span className="font-semibold text-red-700">{formatCurrency(order.amount || 0)}</span>,
                  <span className="text-sm" style={{ color: platinum.muted }}>{formatDate(order.actionDate)}</span>,
                ])}
                emptyTitle="No returns"
                emptyDescription="Product return orders will appear here"
              />
            )}

            <DashboardTable
              title="Customer Reviews"
              description={activeTab === "product" ? "Product reviews from this month" : "Service reviews from this month"}
              columns={["Customer", activeTab === "product" ? "Product" : "Service", "Rating", "Review", "Date"]}
              rows={dashboard.monthlyReviews.map((review) => [
                <span className="text-sm font-medium" style={{ color: platinum.primary }}>{review.customerName}</span>,
                <span className="text-sm" style={{ color: platinum.primary }}>{review.itemName}</span>,
                <span className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${index < (review.rating || 0) ? "fill-amber-400 text-amber-400" : ""}`}
                      style={index < (review.rating || 0) ? undefined : { color: "rgba(123,127,133,0.35)" }}
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-amber-600">{review.rating || 0}</span>
                </span>,
                <span className="max-w-[250px] truncate text-xs" style={{ color: platinum.muted }}>{review.review || "-"}</span>,
                <span className="text-sm" style={{ color: platinum.muted }}>{formatDate(review.reviewDate)}</span>,
              ])}
              emptyTitle="No reviews"
              emptyDescription={activeTab === "product" ? "Product reviews will appear here" : "Service reviews will appear here"}
            />
          </div>

          {activeTab === "product" && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="border shadow-sm" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
                <CardHeader className="border-b pb-4" style={{ borderColor: platinum.border }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.12)" }}>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold" style={{ color: platinum.primary }}>Low Stock Alert</CardTitle>
                      <p className="mt-0.5 text-xs" style={{ color: platinum.muted }}>Products below minimum threshold</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {dashboard.lowStockAlerts.length === 0 ? (
                    <div className="rounded-lg border px-4 py-8 text-center" style={{ borderColor: "#9DB8AB", backgroundColor: "rgba(34,197,94,0.08)" }}>
                      <div className="mb-2 flex justify-center">
                        <Box className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-emerald-700">All products in stock</p>
                    </div>
                  ) : (
                    dashboard.lowStockAlerts.map((product, index) => (
                      <div
                        key={`${product.itemName}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                        style={{ borderColor: "rgba(220,38,38,0.2)", backgroundColor: "rgba(220,38,38,0.08)" }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" style={{ color: platinum.primary }}>{product.itemName}</p>
                          <p className="mt-0.5 text-xs" style={{ color: platinum.muted }}>Min: {product.minimumRequiredQuantity}</p>
                        </div>
                        <span className="rounded-lg px-3 py-1 text-sm font-bold text-red-600" style={{ backgroundColor: "rgba(220,38,38,0.12)" }}>
                          {product.currentQuantity}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <DashboardTable
                title="Top Selling Products"
                description="Best-performing products ranked by units sold"
                columns={["Product", "Units Sold", "Revenue"]}
                rows={dashboard.topSellingItems.map((item) => [
                  <span className="text-sm font-medium" style={{ color: platinum.primary }}>{item.itemName}</span>,
                  <span className="text-center font-semibold" style={{ color: platinum.primary }}>{item.unitsSold}</span>,
                  <span className="font-semibold text-emerald-700">{formatCurrency(item.revenueGenerated)}</span>,
                ])}
                emptyTitle="No sales data"
                emptyDescription="Top products will appear as orders are completed"
              />
            </div>
          )}

          {activeTab === "service" && (
            <DashboardTable
              title="Top Providing Services"
              description="Best-performing services ranked by bookings and revenue"
              columns={["Service", "Bookings", "Revenue"]}
              rows={dashboard.topSellingItems.map((item) => [
                <span className="text-sm font-medium" style={{ color: platinum.primary }}>{item.itemName}</span>,
                <span className="font-semibold" style={{ color: platinum.primary }}>{item.unitsSold}</span>,
                <span className="font-semibold text-emerald-700">{formatCurrency(item.revenueGenerated)}</span>,
              ])}
              emptyTitle="No service data"
              emptyDescription="Completed service performance will appear here"
            />
          )}

          <Card className="border shadow-sm" style={{ backgroundColor: platinum.card, borderColor: platinum.border }}>
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl text-white" style={{ backgroundColor: platinum.primary }}>
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold" style={{ color: platinum.primary }}>Performance Overview</p>
                  <p className="mt-0.5 text-sm" style={{ color: platinum.muted }}>
                    Dashboard updated with isolated {activeTab === "product" ? "product" : "service"} analytics
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border px-4 py-3" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.35)" }}>
                  <p className="text-xs font-medium" style={{ color: platinum.muted }}>Revenue</p>
                  <p className="mt-1.5 font-bold text-emerald-700">{formatCurrency(dashboard.kpis.totalRevenue)}</p>
                </div>
                <div className="rounded-lg border px-4 py-3" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.35)" }}>
                  <p className="text-xs font-medium" style={{ color: platinum.muted }}>{activeTab === "product" ? "Orders" : "Bookings"}</p>
                  <p className="mt-1.5 font-bold text-blue-700">{dashboard.kpis.ordersThisMonth}</p>
                </div>
                <div className="rounded-lg border px-4 py-3" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.35)" }}>
                  <p className="text-xs font-medium" style={{ color: platinum.muted }}>Pending</p>
                  <p className="mt-1.5 font-bold text-amber-700">{dashboard.kpis.pendingOrders}</p>
                </div>
                <div className="rounded-lg border px-4 py-3" style={{ borderColor: platinum.border, backgroundColor: "rgba(255,255,255,0.35)" }}>
                  <p className="text-xs font-medium" style={{ color: platinum.muted }}>Growth</p>
                  <p className={`mt-1.5 font-bold ${dashboard.kpis.revenueGrowth >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {formatPercent(dashboard.kpis.revenueGrowth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
