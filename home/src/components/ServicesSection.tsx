import { motion } from "framer-motion";
import { Wrench, Cog, Disc3, Plug, Paintbrush } from "lucide-react";

const services = [
  { icon: Wrench, title: "Bike Servicing", desc: "Complete maintenance and tune-up for all bike models." },
  { icon: Cog, title: "Engine Repair", desc: "Expert engine diagnostics, overhaul, and rebuilds." },
  { icon: Disc3, title: "Brake & Suspension", desc: "Professional brake and suspension tuning and repair." },
  { icon: Plug, title: "Electrical Repair", desc: "Wiring, ECU diagnostics, and electrical troubleshooting." },
  { icon: Paintbrush, title: "Custom Modifications", desc: "Personalize your ride with custom parts and paint." },
];

const ServicesSection = () => (
  <section id="services" className="section-padding">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Our <span className="text-gradient">Services</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Complete bike care from certified professionals.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-secondary/40 transition-all text-center"
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-secondary/10 text-secondary mb-4">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
