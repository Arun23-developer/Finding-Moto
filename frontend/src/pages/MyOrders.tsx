import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import {
  Package,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  ChevronDown,
  Star,
} from "lucide-react";
import api from "../services/api";
import { resolveMediaUrl } from "@/lib/imageUrl";
import reviewService from "@/services/reviewService";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
  seller?: { firstName: string; lastName: string; shopName?: string };
  createdAt: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, label: "Pending", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
  confirmed: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Confirmed", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  shipped: { icon: <Truck className="h-4 w-4" />, label: "Shipped", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
  delivered: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Delivered", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
  cancelled: { icon: <XCircle className="h-4 w-4" />, label: "Cancelled", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
};

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const [{ data: orderRes }, myReviews] = await Promise.all([
        api.get("/orders/my", { params }),
        reviewService.getMyReviews(),
      ]);

      if (orderRes.success) {
        setOrders(orderRes.data);
      }

      setReviewedProductIds(new Set(myReviews.map((r) => r.productId)));
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setCancellingId(orderId);
      await api.patch(`/orders/my/${orderId}/cancel`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const getImageUrl = (img?: string): string => {
    return resolveMediaUrl(img, "https://placehold.co/80x80?text=Item");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <section className="bg-secondary py-8 border-b border-border">
          <div className="container">
            <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Package className="h-8 w-8 text-accent" />
              My Orders
            </h1>
            <p className="text-muted-foreground">Track and manage your purchases</p>
          </div>
        </section>

        <div className="container py-8">
          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {s === "all" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-3 text-muted-foreground">Loading orders...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchOrders}>Try Again</Button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-20">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter !== "all"
                  ? `No ${statusFilter} orders found.`
                  : "Start shopping to see your orders here!"}
              </p>
              <Button onClick={() => navigate("/products")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </div>
          )}

          {/* Orders list */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const sc = statusConfig[order.status];
                return (
                  <div key={order._id} className={`p-5 rounded-xl border ${sc.bg} transition-all`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-medium ${sc.color}`}>
                        {sc.icon}
                        {sc.label}
                      </div>
                    </div>

                    {/* Items */}
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 py-3 border-t border-border/50">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            LKR {item.price.toLocaleString()} × {item.qty}
                          </p>
                          {order.status === "delivered" && (
                            <div className="mt-2">
                              {reviewedProductIds.has(item.product) ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                  <Star className="h-3.5 w-3.5 fill-green-600 text-green-600" />
                                  Reviewed
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => navigate(`/products/${item.product}`)}
                                >
                                  <Star className="h-3.5 w-3.5 mr-1" />
                                  Rate & Review
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            LKR {(item.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border/50">
                      <div className="text-sm text-muted-foreground space-y-1">
                        {order.seller && (
                          <p>
                            Seller: <strong className="text-foreground">
                              {order.seller.shopName || `${order.seller.firstName} ${order.seller.lastName}`}
                            </strong>
                          </p>
                        )}
                        <p>Payment: {order.paymentMethod}</p>
                        <p className="flex items-center gap-1">
                          <ChevronDown className="h-3 w-3" />
                          {order.shippingAddress}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-foreground">
                            LKR {order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleCancel(order._id)}
                            disabled={cancellingId === order._id}
                          >
                            {cancellingId === order._id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
