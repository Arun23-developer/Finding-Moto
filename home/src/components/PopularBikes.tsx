import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { bikes } from "@/data/products";

const PopularBikes = () => (
  <section className="section-padding bg-surface">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
            Popular <span className="text-gradient">Bikes</span>
          </h2>
          <p className="text-muted-foreground">Trending models recommended by our AI</p>
        </div>
        <Link
          to="/products"
          className="hidden md:inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.slice(0, 6).map((bike, i) => (
          <motion.div
            key={bike.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/products/${bike.id}`}
              className="group block rounded-2xl bg-card border border-border hover:border-primary/30 overflow-hidden transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
                  <span className="text-sm text-accent font-medium group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PopularBikes;
