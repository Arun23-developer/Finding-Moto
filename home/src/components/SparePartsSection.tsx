import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { spareParts } from "@/data/products";

const SparePartsSection = () => (
  <section id="spare-parts" className="section-padding">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Spare Parts <span className="text-gradient">Marketplace</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Genuine parts from top brands at competitive prices.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {spareParts.map((part, i) => (
          <motion.div
            key={part.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-secondary/30 transition-all"
          >
            <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-sm truncate">{part.name}</h3>
              <p className="text-xs text-muted-foreground">{part.brand} · {part.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-heading font-bold text-primary">{part.price}</p>
              <button className="text-xs text-accent font-medium hover:underline mt-1">Add to Cart</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SparePartsSection;
