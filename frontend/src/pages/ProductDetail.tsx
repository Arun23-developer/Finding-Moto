import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  Loader2, 
  ShoppingCart, 
  Star, 
  Zap,
  ShieldCheck,
  Package,
  Truck,
  RotateCcw,
  MessageCircle,
  Share2,
  Heart,
  Store,
  ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api";
import { formatLkr } from "@/lib/currency";
import { resolveProductImage } from "@/lib/imageUrl";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ReportDialog } from "@/components/ReportDialog";
import { cn } from "@/lib/utils";

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
  const [cartBusy, setCartBusy] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

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

  const rating = typeof product?.rating === "number" ? product.rating : 4.8;
  const reviewCount = typeof product?.reviewCount === "number" ? product.reviewCount : 12;
  const categoryLabel = product?.category?.split('/')[0] || "Parts";
  const inStock = product?.inStock !== false && (product?.stock ?? 0) > 0;

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
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-600/50" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Fetching Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <div className="pt-32 pb-20 container mx-auto px-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </Link>
          <div className="max-w-2xl mx-auto rounded-[2rem] border border-red-100 bg-white p-12 text-center shadow-sm">
            <div className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Item Unavailable</h1>
            <p className="text-slate-500 font-medium italic mb-8">{error || "The requested product could not be found."}</p>
            <Button asChild variant="outline" className="rounded-xl px-8 h-12 font-bold">
              <Link to="/products">Browse Other Products</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="pt-28 pb-20 container mx-auto px-4 md:px-6">
        {/* Breadcrumbs / Back */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
              <Share2 size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
              <Heart size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Image Gallery Section */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white aspect-square shadow-sm"
            >
              <img
                src={imgUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute top-6 left-6">
                <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-none px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg">
                  {categoryLabel}
                </Badge>
              </div>

              {!inStock && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-black uppercase tracking-[0.3em] text-xl rotate-[-10deg] border-4 border-white px-8 py-4 rounded-2xl">Out of Stock</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Navigation (Placeholder for now) */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {[1, 2, 3, 4].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                    selectedImage === i ? "border-blue-600 shadow-lg shadow-blue-500/20" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-4">
                <Star size={12} className="fill-current" />
                <span>Top Rated Dealer</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Star size={16} className="fill-current" />
                  <span className="font-black text-sm">{rating}</span>
                  <span className="text-[10px] font-bold opacity-60 ml-0.5">({reviewCount} Reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <Store size={16} />
                  <span>{product.brand || "Genuine Finding Moto Part"}</span>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm mb-8">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Price</p>
                    <p className="text-4xl font-black text-slate-900">{formatLkr(product.price)}</p>
                  </div>
                  {inStock && (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <ShieldCheck size={14} />
                      <span>In Stock</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                    <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-blue-600" />
                    </div>
                    <span>Certified Quality Check</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                    <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-blue-600" />
                    </div>
                    <span>Fast Delivery (2-3 Business Days)</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    disabled={cartBusy || !inStock}
                    onClick={handleAddToCart}
                    className="h-14 flex-1 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-xs transition-all"
                  >
                    {cartBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart size={18} className="mr-2" />}
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    disabled={cartBusy || !inStock}
                    onClick={handleBuyNow}
                    className="h-14 flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Zap size={18} className="mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-2xl bg-slate-100/50 border border-slate-100 space-y-1">
                  <Truck size={20} className="mx-auto text-slate-400" />
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Fast Shipping</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-100/50 border border-slate-100 space-y-1">
                  <ShieldCheck size={20} className="mx-auto text-slate-400" />
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Secure Payment</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-100/50 border border-slate-100 space-y-1">
                  <RotateCcw size={20} className="mx-auto text-slate-400" />
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">Easy Returns</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start bg-transparent h-fit p-0 gap-8 border-b border-slate-200 rounded-none mb-10">
                {["Description", "Specifications", "Reviews"].map((tab) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab.toLowerCase()} 
                    className="px-0 py-4 text-xs font-black uppercase tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 transition-all"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed font-medium text-lg mb-8">
                    {product.description || "No detailed description provided for this product. Please contact the seller for more technical information regarding compatibility and fitting."}
                  </p>
                  
                  <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4">
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                      <Store size={16} />
                      Dealer Information
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                          <Store size={24} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-black tracking-tight">{product.seller?.shopName || product.seller?.workshopName || "Verified Vendor"}</p>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Partner since 2024</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => navigate(`/seller/${product.seller?._id}`)}>
                        Visit Store <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ["Brand", product.brand || "Finding Moto Certified"],
                    ["Category", categoryLabel],
                    ["Inventory", inStock ? `${product.stock} Units Available` : "Restocking Soon"],
                    ["Warranty", "6 Months Manufacturer Warranty"],
                    ["Condition", "Brand New / Genuine"],
                    ["SKU", product._id.slice(-8).toUpperCase()],
                  ].map(([label, value]) => (
                    <div key={label} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                      <span className="text-sm font-black text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <div className="space-y-6">
                  {reviewCount > 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Star size={24} className="text-amber-400 fill-current" />
                        <span className="text-4xl font-black text-slate-900">{rating}</span>
                      </div>
                      <p className="text-slate-500 font-bold text-sm mb-6">Based on {reviewCount} verified purchases</p>
                      <Button variant="outline" className="rounded-xl border-slate-200">Read All Feedback</Button>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
                      <MessageCircle size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-500 font-bold italic">No reviews yet for this part.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Assistance */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2rem] border-slate-200 overflow-hidden bg-slate-900 text-white shadow-xl shadow-slate-900/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-black mb-4">Need Help with Fitting?</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 italic">
                  "Unsure if this part fits your bike? Our experts are available for live consultation."
                </p>
                <div className="space-y-4">
                  <Button 
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs"
                    onClick={() => {
                      if (!user) { navigate('/login'); return; }
                      navigate(`/chat?user=${product.seller?._id}`);
                    }}
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Chat with Expert
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-white/20 text-white hover:bg-white hover:text-slate-900 font-black uppercase tracking-widest text-xs"
                    onClick={() => window.location.href = `tel:+94771234567`}
                  >
                    <Phone size={18} className="mr-2" />
                    Direct Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-6">
              <ReportDialog
                category="PRODUCT"
                targetId={product._id}
                title="Report Listing"
                triggerLabel="Report Inaccurate Information"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

