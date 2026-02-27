import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Search,
  Eye,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  X,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  { id: "#FM-2041", buyer: "Kamal Perera", email: "kamal@email.com", phone: "+94 77 123 4567", product: "Brake Pad Set - Toyota", qty: 2, amount: 9000, status: "pending" as const, date: "2026-02-27", address: "No. 45, Galle Road, Colombo 03", paymentMethod: "Cash on Delivery", notes: "Please deliver before 5 PM" },
  { id: "#FM-2040", buyer: "Nimal Silva", email: "nimal@email.com", phone: "+94 71 234 5678", product: "Oil Filter - Honda", qty: 1, amount: 1200, status: "confirmed" as const, date: "2026-02-26", address: "12/B, Kandy Road, Peradeniya", paymentMethod: "Bank Transfer", notes: "" },
  { id: "#FM-2039", buyer: "Ruwan Fernando", email: "ruwan@email.com", phone: "+94 76 345 6789", product: "Headlight Assembly", qty: 1, amount: 12800, status: "shipped" as const, date: "2026-02-25", address: "78, Main Street, Galle", paymentMethod: "Card Payment", notes: "Gift wrap please" },
  { id: "#FM-2038", buyer: "Saman Kumara", email: "saman@email.com", phone: "+94 70 456 7890", product: "Spark Plugs Set (4)", qty: 2, amount: 6400, status: "delivered" as const, date: "2026-02-24", address: "56, Temple Rd, Matara", paymentMethod: "Cash on Delivery", notes: "" },
  { id: "#FM-2037", buyer: "Ajith Bandara", email: "ajith@email.com", phone: "+94 75 567 8901", product: "Air Filter - Suzuki", qty: 3, amount: 5400, status: "delivered" as const, date: "2026-02-23", address: "34, Lake View, Kurunegala", paymentMethod: "Bank Transfer", notes: "" },
  { id: "#FM-2036", buyer: "Priya Mendis", email: "priya@email.com", phone: "+94 72 678 9012", product: "Radiator Hose Kit", qty: 1, amount: 2800, status: "cancelled" as const, date: "2026-02-22", address: "89, Beach Road, Negombo", paymentMethod: "Card Payment", notes: "Wrong item ordered" },
  { id: "#FM-2035", buyer: "Dinesh Jayawardena", email: "dinesh@email.com", phone: "+94 78 789 0123", product: "Timing Belt - Mitsubishi", qty: 1, amount: 6500, status: "pending" as const, date: "2026-02-21", address: "23, Hill St, Nuwara Eliya", paymentMethod: "Cash on Delivery", notes: "" },
  { id: "#FM-2034", buyer: "Mahesh Wijesinghe", email: "mahesh@email.com", phone: "+94 77 890 1234", product: "Clutch Kit - Nissan", qty: 1, amount: 15000, status: "confirmed" as const, date: "2026-02-20", address: "67, Station Rd, Anuradhapura", paymentMethod: "Bank Transfer", notes: "Urgent shipment needed" },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800", icon: XCircle },
};

const actionLabels: Record<string, string> = {
  pending: "Confirm Order",
  confirmed: "Mark Shipped",
  shipped: "Mark Delivered",
};

// ─── Order Detail Modal ─────────────────────────────────────────────────────
function OrderDetailModal({
  order,
  onClose,
}: {
  order: typeof MOCK_ORDERS[0] | null;
  onClose: () => void;
}) {
  if (!order) return null;

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Order {order.id}</h2>
            <p className="text-sm text-muted-foreground">{order.date}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5" />
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[order.status].color}`}>
              {statusConfig[order.status].label}
            </span>
          </div>

          {/* Buyer */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Buyer Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">{order.buyer}</p>
              <p className="text-muted-foreground">{order.email}</p>
              <p className="text-muted-foreground">{order.phone}</p>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Order Items</h3>
            <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{order.product}</p>
                <p className="text-muted-foreground">Qty: {order.qty}</p>
              </div>
              <p className="font-bold">LKR {order.amount.toLocaleString()}</p>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Delivery Details</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p>{order.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p>{order.paymentMethod}</p>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Close
          </button>
          {actionLabels[order.status] && (
            <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25">
              {actionLabels[order.status]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Orders Page ────────────────────────────────────────────────────────────
export default function SellerOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchSearch = o.buyer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: MOCK_ORDERS.length,
    pending: MOCK_ORDERS.filter((o) => o.status === "pending").length,
    confirmed: MOCK_ORDERS.filter((o) => o.status === "confirmed").length,
    shipped: MOCK_ORDERS.filter((o) => o.status === "shipped").length,
    delivered: MOCK_ORDERS.filter((o) => o.status === "delivered").length,
    cancelled: MOCK_ORDERS.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{MOCK_ORDERS.length} total orders</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">
          <FileText className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((status) => {
          const Icon = statusConfig[status].icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              className={cn(
                "rounded-lg border p-4 text-left transition-all",
                statusFilter === status ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-blue-300"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground capitalize">{status}</span>
              </div>
              <p className="text-2xl font-bold">{statusCounts[status]}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, buyer, or product..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    statusFilter === s
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {s === "all" ? `All (${statusCounts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s as keyof typeof statusCounts]})`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">Buyer</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Product</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Qty</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">{order.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{order.buyer.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{order.buyer}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{order.product}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">×{order.qty}</td>
                    <td className="py-3 px-4 font-semibold">LKR {order.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{order.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[order.status].color}`}>
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {actionLabels[order.status] && (
                          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                            {actionLabels[order.status]}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No orders found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
