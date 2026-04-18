import { motion } from "framer-motion";
import { Star, User } from "lucide-react";
import { mechanics } from "@/data/products";

const MechanicsSection = () => (
  <section id="mechanics" className="section-padding bg-surface">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Trusted <span className="text-gradient">Mechanics</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Verified professionals ready to take care of your ride.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mechanics.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all text-center"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-1">{m.name}</h3>
            <p className="text-sm text-primary font-medium mb-1">{m.specialty}</p>
            <p className="text-sm text-muted-foreground mb-3">{m.experience} Experience</p>
            <div className="flex items-center justify-center gap-1 text-primary text-sm mb-4">
              <Star className="h-4 w-4 fill-current" /> {m.rating}
            </div>
            <button className="w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
              Book Now
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MechanicsSection;
