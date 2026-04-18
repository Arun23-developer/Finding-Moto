import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import api from "@/services/api";
import { resolveProductImage } from "@/lib/imageUrl";

type PublicProduct = {
  _id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  image?: string | null;
  images?: string[];
  stock?: number;
  inStock?: boolean;
};

type PublicProductsResponse = {
  success: boolean;
  data: PublicProduct[];
  meta?: { page: number; limit: number; total: number; pages: number };
};

const Products = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get<PublicProductsResponse>("/public/products", {
          params: { page: 1, limit: 18, sort: "popular" },
        });

        if (!cancelled) {
          setProducts(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load products. Please try again.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              All <span className="text-gradient">Products</span>
            </h1>
            <p className="text-muted-foreground">Browse our live inventory from verified sellers.</p>
          </motion.div>

          {loading && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading products...
            </div>
          )}

          {!loading && error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-muted-foreground">No products found.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {items.map((product, i) => {
              const imgUrl = resolveProductImage(product, undefined);
              const categoryLabel = product.category || "Product";
              const rating = typeof product.rating === "number" ? product.rating : 0;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.25) }}
                >
                  <Link
                    to={`/products/${product._id}`}
                    className="group block rounded-2xl bg-card border border-border hover:border-primary/30 overflow-hidden transition-all"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
                        {categoryLabel}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <h3 className="font-heading font-semibold text-lg truncate">{product.name}</h3>
                        <div className="flex items-center gap-1 text-primary text-sm shrink-0">
                          <Star className="h-3.5 w-3.5 fill-current" /> {rating}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.brand ? `${product.brand} • ` : ""}
                        {product.inStock === false ? "Out of stock" : "In stock"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-heading font-bold text-primary">
                          LKR {Number(product.price || 0).toLocaleString()}
                        </span>
                        <span className="text-sm text-accent font-medium group-hover:underline">View Details →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
