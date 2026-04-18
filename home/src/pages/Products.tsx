import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { bikes } from "@/data/products";

const Products = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 section-padding">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            All <span className="text-gradient">Bikes</span>
          </h1>
          <p className="text-muted-foreground">Browse our complete collection of motorcycles.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.map((bike, i) => (
            <motion.div
              key={bike.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/products/${bike.id}`}
                className="group block rounded-2xl bg-card border border-border hover:border-primary/30 overflow-hidden transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={bike.image} alt={bike.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
                    {bike.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-lg">{bike.name}</h3>
                    <div className="flex items-center gap-1 text-primary text-sm">
                      <Star className="h-3.5 w-3.5 fill-current" /> {bike.rating}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{bike.specs}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-heading font-bold text-primary">{bike.price}</span>
                    <span className="text-sm text-accent font-medium group-hover:underline">View Details →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Products;
