import { useState, useEffect } from "react";
import { Star, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
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
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  wished: boolean;
  onToggleWishlist: (id: string) => void;
}

function getImageUrl(product: Product): string {
  return resolveProductImage(product, "https://placehold.co/400x400?text=No+Image");
}

function ProductCard({ product, wished, onToggleWishlist }: ProductCardProps): JSX.Element {
  const navigate = useNavigate();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const imgUrl = getImageUrl(product);

  return (
    <div className="group relative bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-secondary">
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded bg-accent text-accent-foreground">
            -{discount}%
          </span>
        )}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product._id);
          }}
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-medium text-accent mb-1">{product.brand}</p>
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-sm font-medium text-foreground">{product.rating}</span>
          <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                LKR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={product.inStock ? "accent" : "outline"}
            disabled={!product.inStock}
            className="gap-1"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const TrendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("wishlistProductIds");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("wishlistProductIds", JSON.stringify(wishlist));
  }, [wishlist]);

  const onToggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((pid) => pid !== id) : [...prev, id];
      toast({
        title: exists ? "Removed from wishlist" : "Added to wishlist",
      });
      return next;
    });
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data: res } = await api.get("/public/products/trending");
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch trending products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trending Products
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Top-rated parts and accessories loved by riders worldwide
            </p>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <Link to="/products">View All Products</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products available yet. Check back soon!</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} wished={wishlist.includes(product._id)} onToggleWishlist={onToggleWishlist} />
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};
