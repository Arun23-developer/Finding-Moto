import React, { useState } from "react";
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
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  brand: string;
  category: string;
  inStock: boolean;
}

const products: Product[] = [
  {
    id: "1", name: "High-Performance Brake Pads Set", price: 89.99, originalPrice: 119.99,
    rating: 4.8, reviewCount: 234, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    brand: "Brembo", category: "Brakes", inStock: true,
  },
  {
    id: "2", name: "LED Headlight Kit - Universal Fit", price: 149.99,
    rating: 4.6, reviewCount: 189, image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop",
    brand: "J.W. Speaker", category: "Electronics", inStock: true,
  },
  {
    id: "3", name: "Racing Exhaust System - Full Titanium", price: 799.99, originalPrice: 999.99,
    rating: 4.9, reviewCount: 156, image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop",
    brand: "Akrapovic", category: "Performance", inStock: true,
  },
  {
    id: "4", name: "Carbon Fiber Mirror Set", price: 124.99,
    rating: 4.5, reviewCount: 98, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop",
    brand: "CRG", category: "Accessories", inStock: false,
  },
  {
    id: "5", name: "Engine Oil Filter - Premium", price: 24.99,
    rating: 4.7, reviewCount: 312, image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
    brand: "K&N", category: "Engine", inStock: true,
  },
  {
    id: "6", name: "Motorcycle Chain & Sprocket Kit", price: 189.99, originalPrice: 229.99,
    rating: 4.8, reviewCount: 201, image: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=400&h=400&fit=crop",
    brand: "RK", category: "Drivetrain", inStock: true,
  },
  {
    id: "7", name: "Sport Handlebar Grips", price: 34.99,
    rating: 4.4, reviewCount: 178, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    brand: "Renthal", category: "Accessories", inStock: true,
  },
  {
    id: "8", name: "Hydraulic Clutch Kit", price: 259.99,
    rating: 4.7, reviewCount: 89, image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=400&fit=crop",
    brand: "Magura", category: "Controls", inStock: true,
  },
  {
    id: "9", name: "Quick-Release Tank Bag", price: 79.99,
    rating: 4.6, reviewCount: 145, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop",
    brand: "SW-Motech", category: "Luggage", inStock: true,
  },
];

const categories: string[] = ["All", "Engine", "Brakes", "Electronics", "Performance", "Accessories", "Drivetrain", "Controls", "Luggage"];
const brands: string[] = ["All Brands", "Brembo", "Akrapovic", "K&N", "RK", "CRG", "Renthal", "Magura", "SW-Motech", "J.W. Speaker"];
const sortOptions: string[] = ["Most Popular", "Price: Low to High", "Price: High to Low", "Newest", "Best Rating"];

type ViewMode = "grid" | "list";

const Products: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <section className="bg-secondary py-8 border-b border-border">
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
              <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                {sortOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
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
                <div className="p-4 rounded-xl bg-card border border-border">
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

                <div className="p-4 rounded-xl bg-card border border-border">
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

                <div className="p-4 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" className="h-9" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="number" placeholder="Max" className="h-9" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">Apply</Button>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border">
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
                Showing {filteredProducts.length} products
              </p>

              <div className={viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"}>
                {filteredProducts.map((product) => {
                  const discount = product.originalPrice
                    ? Math.round((1 - product.price / product.originalPrice) * 100)
                    : 0;

                  if (viewMode === "list") {
                    return (
                      <div key={product.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-hover transition-all">
                        <div className="relative w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-secondary">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-foreground">${product.price}</span>
                              {product.originalPrice && (
                                <span className="ml-2 text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
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
                    <div key={product.id} className="group bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-secondary">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="text-sm font-medium text-foreground">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-foreground">${product.price}</span>
                            {product.originalPrice && (
                              <span className="ml-2 text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          <Button size="sm" variant={product.inStock ? "accent" : "outline"} disabled={!product.inStock} className="gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">Add</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-12">
                <Button variant="outline" size="lg">Load More Products</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
