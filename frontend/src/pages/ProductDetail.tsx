import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Star,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Minus,
  Plus,
  MapPin,
  CreditCard,
  CheckCircle2,
  Package,
  Truck,
  Store,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "@/lib/imageUrl";
import reviewService from "@/services/reviewService";

interface ProductDetail {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string | null;
  images: string[];
  brand: string;
  category: string;
  description: string;
  inStock: boolean;
  stock: number;
  type: "product" | "service";
  seller: { _id: string; firstName: string; lastName: string; shopName?: string };
  reviews: Array<{
    _id: string;
    buyer?: {
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Order form
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [qty, setQty] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [notes, setNotes] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data: res } = await api.get(`/public/products/${id}`);
      if (res.success) {
        setProduct(res.data);
      }
    } catch {
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getImageUrl = (img: string | null): string =>
    resolveMediaUrl(img, "https://placehold.co/600x600?text=No+Image");

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setOrderError("Please enter a shipping address");
      return;
    }

    try {
      setOrderLoading(true);
      setOrderError("");
      const { data: res } = await api.post("/orders", {
        productId: product!._id,
        qty,
        shippingAddress,
        paymentMethod,
        notes,
      });
      if (res.success) {
        setOrderSuccess(true);
        setTimeout(() => {
          navigate("/my-orders");
        }, 2000);
      }
    } catch (err: any) {
      setOrderError(err.response?.data?.message || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      setReviewError('Only buyer accounts can submit reviews.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a short review comment.');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError('');
      setReviewSuccess('');
      await reviewService.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewComment('');
      setReviewSuccess('Your review has been saved.');
      await fetchProduct();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-3 text-muted-foreground">Loading product...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error || "Product not found"}</p>
            <Button variant="outline" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const mainImage = getImageUrl(product.image || product.images?.[0] || null);

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-2">
              Your order for <strong>{product.name}</strong> has been placed.
            </p>
            <p className="text-muted-foreground mb-6">
              Total: <strong className="text-foreground">LKR {(product.price * qty).toLocaleString()}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">Redirecting to your orders...</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/products")}>
                Continue Shopping
              </Button>
              <Button onClick={() => navigate("/my-orders")}>
                View My Orders
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container py-8">
          {/* Back button */}
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent">
                    {product.category}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                    {product.type === "service" ? "Service" : "Product"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-sm text-muted-foreground">
                  by <strong>{product.seller?.shopName || `${product.seller?.firstName} ${product.seller?.lastName}`}</strong>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">
                  LKR {product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      LKR {product.originalPrice.toLocaleString()}
                    </span>
                    <span className="px-2 py-1 text-sm font-bold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {product.type === "service" ? "Available" : `In Stock (${product.stock} available)`}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Brand */}
              {product.brand && (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium text-foreground">{product.brand}</span>
                </div>
              )}

              {/* Seller info card */}
              {product.seller && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {product.seller.shopName || `${product.seller.firstName} ${product.seller.lastName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Seller</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/seller/${product.seller._id}`);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) { navigate('/login'); return; }
                        navigate(`/chat?user=${product.seller._id}`);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!showOrderForm ? (
                <div className="flex gap-3 pt-4">
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    disabled={!product.inStock}
                    onClick={() => {
                      if (!user) {
                        navigate("/login");
                        return;
                      }
                      setShowOrderForm(true);
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.inStock ? "Order Now" : "Out of Stock"}
                  </Button>
                </div>
              ) : (
                /* Order Form */
                <div className="space-y-4 p-6 rounded-xl bg-card border-2 border-accent/30 shadow-lg">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent" />
                    Place Your Order
                  </h3>

                  {orderError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                      {orderError}
                    </div>
                  )}

                  {/* Quantity */}
                  {product.type !== "service" && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Quantity</label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-bold text-lg">{qty}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-2">Max: {product.stock}</span>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-accent" />
                      {product.type === "service" ? "Your Address" : "Shipping Address"} *
                    </label>
                    <Input
                      placeholder="Enter your full address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-accent" />
                      Payment Method
                    </label>
                    <select
                      className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card Payment">Card Payment</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Notes (optional)
                    </label>
                    <Input
                      placeholder="Any special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Item</span>
                      <span className="text-foreground">{product.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="text-foreground">LKR {product.price.toLocaleString()}</span>
                    </div>
                    {product.type !== "service" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="text-foreground">×{qty}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-accent">LKR {(product.price * qty).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowOrderForm(false);
                        setOrderError("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handlePlaceOrder}
                      disabled={orderLoading}
                    >
                      {orderLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4" />
                          Confirm Order — LKR {(product.price * qty).toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 space-y-6">
            <div className="p-5 rounded-xl border border-border bg-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Rate This Product</h2>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 ${s <= reviewRating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Share your experience with this product..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              {reviewError && <p className="text-sm text-destructive mt-2">{reviewError}</p>}
              {reviewSuccess && <p className="text-sm text-green-600 mt-2">{reviewSuccess}</p>}
              <div className="mt-3 flex justify-end">
                <Button onClick={handleSubmitReview} disabled={reviewSubmitting}>
                  {reviewSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Customer Reviews ({product.reviews?.length || 0})
              </h2>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review._id} className="p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${s <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(review.buyer?.firstName || review.buyer?.lastName)
                            ? `${review.buyer?.firstName || ''} ${review.buyer?.lastName || ''}`.trim()
                            : 'Verified Buyer'}
                        </p>
                      </div>
                      <p className="text-sm text-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to rate this product.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
