import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";

const trendingProducts = [
  {
    id: "1",
    name: "High-Performance Brake Pads Set",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    brand: "Brembo",
    inStock: true,
  },
  {
    id: "2",
    name: "LED Headlight Kit - Universal Fit",
    price: 149.99,
    rating: 4.6,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop",
    brand: "J.W. Speaker",
    inStock: true,
  },
  {
    id: "3",
    name: "Racing Exhaust System - Full Titanium",
    price: 799.99,
    originalPrice: 999.99,
    rating: 4.9,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop",
    brand: "Akrapovic",
    inStock: true,
  },
  {
    id: "4",
    name: "Carbon Fiber Mirror Set",
    price: 124.99,
    rating: 4.5,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop",
    brand: "CRG",
    inStock: false,
  },
  {
    id: "5",
    name: "Engine Oil Filter - Premium",
    price: 24.99,
    rating: 4.7,
    reviewCount: 312,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
    brand: "K&N",
    inStock: true,
  },
  {
    id: "6",
    name: "Motorcycle Chain & Sprocket Kit",
    price: 189.99,
    originalPrice: 229.99,
    rating: 4.8,
    reviewCount: 201,
    image: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=400&h=400&fit=crop",
    brand: "RK",
    inStock: true,
  },
];

function ProductCard({ product }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-secondary">
        <img
          src={product.image}
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
        >
          <Heart className="h-4 w-4" />
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
            <span className="text-lg font-bold text-foreground">${product.price}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={product.inStock ? "accent" : "outline"}
            disabled={!product.inStock}
            className="gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TrendingProducts() {
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
          <Button variant="outline" className="w-fit">
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trendingProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
