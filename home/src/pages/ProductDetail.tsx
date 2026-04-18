import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Zap, ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { bikes } from "@/data/products";

const tabs = ["Description", "Specifications", "Reviews", "Shipping"];

const ProductDetail = () => {
  const { id } = useParams();
  const bike = bikes.find((b) => b.id === id);
  const [activeTab, setActiveTab] = useState("Description");

  if (!bike) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 section-padding">
        <div className="container mx-auto">
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl overflow-hidden border border-border"
            >
              <img src={bike.image} alt={bike.name} className="w-full aspect-square object-cover" />
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                {bike.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{bike.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" /> {bike.rating}
                </div>
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-sm text-muted-foreground">{bike.specs}</span>
              </div>
              <p className="text-2xl font-heading font-bold text-primary mb-6">{bike.price}</p>

              <div className="flex items-center gap-2 text-sm text-accent mb-6">
                <Check className="h-4 w-4" /> In Stock — Ready to Ship
              </div>

              <div className="flex gap-3 mb-8">
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity neon-glow-orange">
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-secondary text-secondary font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
              </div>

              {/* Tabs */}
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
                {activeTab === "Description" && <p>{bike.description}</p>}
                {activeTab === "Specifications" && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Engine", bike.engine],
                      ["Power", bike.power],
                      ["Torque", bike.torque],
                      ["Weight", bike.weight],
                      ["Top Speed", bike.topSpeed],
                      ["Fuel Capacity", bike.fuelCapacity],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="font-heading font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "Reviews" && <p>No reviews yet. Be the first to review this bike!</p>}
                {activeTab === "Shipping" && <p>Free shipping across India. Delivery within 7-10 business days. EMI options available.</p>}
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
