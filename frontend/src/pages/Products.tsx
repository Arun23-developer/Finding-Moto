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

const Products: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");

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
  }, [selectedCategory, sortBy]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(1);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const getImageUrl = (product: Product): string => {
    const img = product.image || product.images?.[0];
    if (!img) return "https://placehold.co/400x400?text=No+Image";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${img}`;
  };

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
                  <div className="space-y-2">
                    {categories.map((category) => (
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
                  </div>
                </div>

                <div className="sidebar-panel">
                  <h3 className="font-semibold text-foreground mb-4">Brands</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="rounded border-input" />
                        <span className="text-muted-foreground hover:text-foreground">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sidebar-panel">
                  <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" className="h-9" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="number" placeholder="Max" className="h-9" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">Apply</Button>
                </div>

                <div className="sidebar-panel">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
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
                    const imgUrl = getImageUrl(product);

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
                              <Button size="icon" variant="ghost" aria-label="Add to wishlist">
                                <Heart className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="accent" disabled={!product.inStock}>
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
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Add to wishlist">
                          <Heart className="h-4 w-4" />
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
                            <Button size="sm" variant={product.inStock ? "accent" : "outline"} disabled={!product.inStock} className="gap-1">
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
