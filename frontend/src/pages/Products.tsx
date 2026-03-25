import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Star,
  Heart,
  ShoppingCart,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { resolveProductImage } from "@/lib/imageUrl";
import { toast } from "@/hooks/use-toast";

interface Product {
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
  inStock: boolean;
  stock: number;
  description: string;
  seller?: { _id: string; firstName: string; lastName: string; shopName?: string };
}

type ViewMode = "grid" | "list";

const sortOptions: { label: string; value: string }[] = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Best Rating", value: "rating" },
];

const CATEGORY_TREE: Array<{ value: string; label: string; children: Array<{ value: string; label: string }> }> = [
  {
    value: "engine_system",
    label: "Engine System",
    children: [
      { value: "engine_system/piston", label: "Piston" },
      { value: "engine_system/cylinder_block", label: "Cylinder Block" },
      { value: "engine_system/crankshaft", label: "Crankshaft" },
      { value: "engine_system/camshaft", label: "Camshaft" },
      { value: "engine_system/spark_plug", label: "Spark Plug" },
    ],
  },
  {
    value: "fuel_system",
    label: "Fuel System",
    children: [
      { value: "fuel_system/fuel_injector", label: "Fuel Injector" },
      { value: "fuel_system/fuel_tank", label: "Fuel Tank" },
      { value: "fuel_system/fuel_pump", label: "Fuel Pump" },
      { value: "fuel_system/fuel_filter", label: "Fuel Filter" },
    ],
  },
  {
    value: "brake_system",
    label: "Brake System",
    children: [
      { value: "brake_system/brake_disc", label: "Brake Disc" },
      { value: "brake_system/brake_pad", label: "Brake Pad" },
      { value: "brake_system/brake_caliper", label: "Brake Caliper" },
    ],
  },
  {
    value: "transmission_system",
    label: "Transmission System",
    children: [
      { value: "transmission_system/clutch_plate", label: "Clutch Plate" },
      { value: "transmission_system/chain_sprocket", label: "Chain Sprocket" },
      { value: "transmission_system/drive_chain", label: "Drive Chain" },
    ],
  },
  {
    value: "suspension_system",
    label: "Suspension System",
    children: [
      { value: "suspension_system/front_fork", label: "Front Fork" },
      { value: "suspension_system/rear_shock_absorber", label: "Rear Shock Absorber" },
      { value: "suspension_system/swing_arm", label: "Swing Arm" },
    ],
  },
  {
    value: "electrical_system",
    label: "Electrical System",
    children: [
      { value: "electrical_system/battery", label: "Battery" },
      { value: "electrical_system/headlight", label: "Headlight" },
      { value: "electrical_system/ecu", label: "ECU" },
      { value: "electrical_system/starter_motor", label: "Starter Motor" },
      { value: "electrical_system/wiring_harness", label: "Wiring Harness" },
      { value: "electrical_system/indicators", label: "Indicators" },
    ],
  },
  {
    value: "body_parts",
    label: "Body Parts",
    children: [
      { value: "body_parts/seat", label: "Seat" },
      { value: "body_parts/mirrors", label: "Mirrors" },
      { value: "body_parts/mudguard", label: "Mudguard" },
      { value: "body_parts/side_panel", label: "Side Panel" },
      { value: "body_parts/number_plate_holder", label: "Number Plate Holder" },
    ],
  },
  {
    value: "wheels",
    label: "Wheels",
    children: [
      { value: "wheels/tyre", label: "Tyre" },
      { value: "wheels/rim", label: "Rim" },
      { value: "wheels/spokes", label: "Spokes" },
    ],
  },
];

const Products: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [brandSearchQuery, setBrandSearchQuery] = useState<string>("");
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("wishlistProductIds");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [brands, setBrands] = useState<string[]>(["All Brands"]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProducts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {
        page: pageNum.toString(),
        limit: "12",
        sort: sortBy,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedBrand && selectedBrand !== "All Brands") params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (inStockOnly) params.inStockOnly = "true";

      const { data: res } = await api.get("/public/products", { params });

      if (res.success) {
        setProducts(append ? (prev) => [...prev, ...res.data] : res.data);
        setTotalPages(res.meta.pages);
        setTotal(res.meta.total);
        setPage(pageNum);
        if (res.filters) {
          setCategories(res.filters.categories);
          setBrands(res.filters.brands);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, selectedBrand]);

  useEffect(() => {
    localStorage.setItem("wishlistProductIds", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      toast({
        title: exists ? "Removed from wishlist" : "Added to wishlist",
        description: exists ? "Product removed successfully." : "Product saved for later.",
      });
      return next;
    });
  };

  const handleAddToCart = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  const applyFilters = () => {
    fetchProducts(1);
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  const q = categorySearchQuery.trim().toLowerCase();
  const filteredCategoryTree = CATEGORY_TREE
    .map((group) => {
      const groupMatches =
        group.label.toLowerCase().includes(q) || group.value.toLowerCase().includes(q);
      const children = group.children.filter(
        (child) =>
          child.label.toLowerCase().includes(q) || child.value.toLowerCase().includes(q)
      );
      if (!q || groupMatches) {
        return { ...group, children: group.children };
      }
      if (children.length > 0) {
        return { ...group, children };
      }
      return null;
    })
    .filter((group): group is { value: string; label: string; children: Array<{ value: string; label: string }> } => group !== null);

  const knownCategoryValues = new Set(
    CATEGORY_TREE.flatMap((group) => [group.value, ...group.children.map((child) => child.value)])
  );
  const extraCategories = categories
    .filter((c) => c !== "All" && !knownCategoryValues.has(c));
  const filteredExtraCategories = extraCategories.filter((c) => c.toLowerCase().includes(q));

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(1);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        {/* Page Header */}
        <section className="section-band-divider bg-secondary py-8">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Motorcycle Parts & Accessories
            </h1>
            <p className="text-muted-foreground">
              Browse our extensive catalog of quality parts from trusted brands
            </p>
          </div>
        </section>

        {/* Filters & Products */}
        <div className="container py-8">
          {/* Search & Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search parts by name or brand..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <select
                className="control-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="hidden sm:flex items-center border border-input rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary/50"}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list" ? "bg-secondary" : "hover:bg-secondary/50"}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
              <div className="sticky top-24 space-y-6">
                <div className="sidebar-panel">
                  <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                  <Input
                    type="text"
                    placeholder="Search category..."
                    className="h-9 mb-3"
                    value={categorySearchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategorySearchQuery(e.target.value)}
                  />
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === "All"
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {filteredCategoryTree.map((group) => (
                      <div key={group.value}>
                        <button
                          onClick={() => setSelectedCategory(group.value)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === group.value
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {group.label}
                        </button>
                        <div className="pl-3 space-y-1.5">
                          {group.children.map((child) => (
                            <button
                              key={child.value}
                              onClick={() => setSelectedCategory(child.value)}
                              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                                selectedCategory === child.value
                                  ? "bg-accent/80 text-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                              }`}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filteredExtraCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {category}
                      </button>
                    ))}

                    {q && filteredCategoryTree.length === 0 && filteredExtraCategories.length === 0 && (
                      <p className="text-xs text-muted-foreground">No categories found.</p>
                    )}
                  </div>
                </div>

                <div className="sidebar-panel">
                  <h3 className="font-semibold text-foreground mb-4">Brands</h3>
                  <Input
                    type="text"
                    placeholder="Search brand..."
                    className="h-9 mb-3"
                    value={brandSearchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandSearchQuery(e.target.value)}
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="brand-filter"
                          className="rounded border-input"
                          checked={selectedBrand === brand}
                          onChange={() => handleBrandSelect(brand)}
                        />
                        <span className="text-muted-foreground hover:text-foreground">{brand}</span>
                      </label>
                    ))}
                    {filteredBrands.length === 0 && (
                      <p className="text-xs text-muted-foreground">No brands found.</p>
                    )}
                  </div>
                </div>

                <div className="sidebar-panel">
                  <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" className="h-9" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <span className="text-muted-foreground">-</span>
                    <Input type="number" placeholder="Max" className="h-9" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={applyFilters}>Apply</Button>
                </div>

                <div className="sidebar-panel">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <span className="text-sm text-foreground">In Stock Only</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                Showing {products.length} of {total} products
              </p>

              {/* Loading State */}
              {loading && products.length === 0 && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <span className="ml-3 text-muted-foreground">Loading products...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button variant="outline" onClick={() => fetchProducts(1)}>Try Again</Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && products.length === 0 && (
                <div className="text-center py-20">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}

              {products.length > 0 && (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"}>
                {products.map((product) => {
                    const discount = product.originalPrice
                      ? Math.round((1 - product.price / product.originalPrice) * 100)
                      : 0;
                    const imgUrl = resolveProductImage(product, "https://placehold.co/400x400?text=No+Image");

                    if (viewMode === "list") {
                      return (
                        <div key={product._id} className="panel-card-interactive flex gap-4 p-4 cursor-pointer" onClick={() => navigate(`/products/${product._id}`)}>
                          <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-secondary">
                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                          {discount > 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded bg-accent text-accent-foreground">-{discount}%</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-accent mb-1">{product.brand}</p>
                          <h3 className="font-semibold text-foreground mb-2 truncate">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-sm font-medium">{product.rating}</span>
                            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                          </div>
                          {product.seller && (
                            <p className="text-xs text-muted-foreground mb-2 truncate">
                              by {product.seller.shopName || `${product.seller.firstName} ${product.seller.lastName}`}
                            </p>
                          )}
                          {product.seller && (
                            <button
                              type="button"
                              className="text-xs text-accent hover:underline mb-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/seller/${product.seller!._id}`);
                              }}
                            >
                              View seller profile
                            </button>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
                              {product.originalPrice && (
                                <span className="ml-2 text-sm text-muted-foreground line-through">LKR {product.originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {product.seller && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Message seller"
                                  title="Message seller"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!user) { navigate('/login'); return; }
                                    navigate(`/chat?user=${product.seller!._id}`);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" aria-label="Add to wishlist" onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}>
                                <Heart className={`h-4 w-4 ${wishlist.includes(product._id) ? "fill-current" : ""}`} />
                              </Button>
                              <Button size="sm" variant="accent" disabled={!product.inStock} onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                {product.inStock ? "Add" : "Out of Stock"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                    return (
                      <div key={product._id} className="panel-card-interactive group cursor-pointer" onClick={() => navigate(`/products/${product._id}`)}>
                        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-secondary">
                          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded bg-accent text-accent-foreground">-{discount}%</span>
                        )}
                        <button
                          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label="Add to wishlist"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product._id);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${wishlist.includes(product._id) ? "fill-current" : ""}`} />
                        </button>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-medium text-accent mb-1">{product.brand}</p>
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="text-sm font-medium text-foreground">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                        </div>
                        {product.seller && (
                          <p className="text-xs text-muted-foreground mb-3 truncate">
                            by {product.seller.shopName || `${product.seller.firstName} ${product.seller.lastName}`}
                          </p>
                        )}
                        {product.seller && (
                          <button
                            type="button"
                            className="text-xs text-accent hover:underline mb-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/seller/${product.seller!._id}`);
                            }}
                          >
                            View seller profile
                          </button>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="ml-2 text-sm text-muted-foreground line-through">LKR {product.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {product.seller && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                aria-label="Message seller"
                                title="Message seller"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!user) { navigate('/login'); return; }
                                  navigate(`/chat?user=${product.seller!._id}`);
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={product.inStock ? "accent" : "outline"}
                              disabled={!product.inStock}
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span className="sr-only sm:not-sr-only">Add</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Load More */}
              {page < totalPages && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchProducts(page + 1, true)}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More Products"}
                </Button>
              </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
