import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Loader2, ShoppingCart, Star, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/services/api";
import { formatLkr } from "@/lib/currency";
import { resolveProductImage } from "@/lib/imageUrl";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ReportDialog } from "@/components/ReportDialog";

const tabs = ["Description", "Specifications", "Reviews", "Shipping"];

type PublicProductDetail = {
  _id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  image?: string | null;
  inStock?: boolean;
  stock?: number;
  seller?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    shopName?: string;
    workshopName?: string;
  };
};

type PublicProductDetailResponse = { success: boolean; data: PublicProductDetail };

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<PublicProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("Description");
  const [cartBusy, setCartBusy] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get<PublicProductDetailResponse>(`/public/products/${id}`);
        if (!cancelled) {
          setProduct(data?.data ?? null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setProduct(null);
          setError(e?.response?.data?.message || "Failed to load product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const imgUrl = useMemo(() => {
    if (!product) return "";
    return resolveProductImage(product, undefined);
  }, [product]);

  const rating = typeof product?.rating === "number" ? product.rating : 0;
  const categoryLabel = product?.category || "Product";
  const inStock = product?.inStock !== false;

  const requireBuyer = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in as a buyer to continue.",
      });
      navigate("/login");
      return false;
    }

    if (user.role !== "buyer") {
      toast({
        variant: "destructive",
        title: "Buyer account required",
        description: "Please switch to a buyer account to purchase products.",
      });
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!product?._id) return;
    if (!requireBuyer()) return;

    try {
      setCartBusy(true);
      const result = await addToCart({ productId: product._id, quantity: 1 });
      toast({ title: "Added to cart", description: result.message });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Unable to add to cart",
        description: e?.response?.data?.message || "Please try again.",
      });
    } finally {
      setCartBusy(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?._id) return;
    if (!requireBuyer()) return;

    try {
      setCartBusy(true);
      await addToCart({ productId: product._id, quantity: 1 });
      navigate("/buyer/cart");
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Unable to continue",
        description: e?.response?.data?.message || "Please try again.",
      });
    } finally {
      setCartBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading product...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 section-padding">
          <div className="container mx-auto">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </Link>
            <div className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-semibold mb-1">Unable to load product</h1>
                <p className="text-sm text-muted-foreground">{error || "Product not found."}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl overflow-hidden border border-border"
            >
              <img
                src={imgUrl}
                alt={product.name}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                {categoryLabel}
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" /> {rating}
                </div>
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-sm text-muted-foreground">
                  {product.brand ? product.brand : "Verified listing"}
                </span>
              </div>
              <p className="text-2xl font-heading font-bold text-primary mb-6">
                {formatLkr(product.price)}
              </p>

              <div className="flex items-center gap-2 text-sm text-accent mb-6">
                <Check className="h-4 w-4" />
                {inStock ? "In Stock — Ready to Ship" : "Out of stock"}
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  type="button"
                  disabled={cartBusy || !inStock}
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity neon-glow-orange disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cartBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                  Add to Cart
                </button>
                <button
                  type="button"
                  disabled={cartBusy || !inStock}
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
              </div>

              <div className="flex justify-end mb-6">
                <ReportDialog
                  category="PRODUCT"
                  targetId={product._id}
                  title="Report Product"
                  triggerLabel="Report Product"
                />
              </div>

              <div className="border-b border-border flex gap-1 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed">
                {activeTab === "Description" && (
                  <div className="space-y-3">
                    <p>{product.description || "No description available."}</p>
                    {product.seller && (
                      <p className="text-xs text-muted-foreground">
                        Sold by {product.seller.shopName || product.seller.workshopName || "Seller"}
                      </p>
                    )}
                  </div>
                )}
                {activeTab === "Specifications" && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Brand", product.brand || "—"],
                      ["Category", categoryLabel],
                      ["Stock", typeof product.stock === "number" ? product.stock : "—"],
                      ["Rating", rating],
                      ["Reviews", typeof product.reviewCount === "number" ? product.reviewCount : 0],
                      ["Status", inStock ? "In Stock" : "Out of stock"],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="font-heading font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "Reviews" && (
                  <p>
                    {typeof product.reviewCount === "number" && product.reviewCount > 0
                      ? `This product has ${product.reviewCount} review(s).`
                      : "No reviews yet."}
                  </p>
                )}
                {activeTab === "Shipping" && (
                  <p>Free shipping across India. Delivery within 7-10 business days. EMI options available.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
