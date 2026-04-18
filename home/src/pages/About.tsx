import { motion } from "framer-motion";
import { Zap, Users, Target, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { icon: Users, label: "Active Riders", value: "50K+" },
  { icon: Target, label: "Bikes Listed", value: "2,000+" },
  { icon: Globe, label: "Cities Covered", value: "120+" },
  { icon: Zap, label: "AI Queries/Day", value: "100K+" },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 section-padding">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            About <span className="text-gradient">MotoMind AI</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We are an AI-driven automobile platform helping riders find bikes, parts, mechanics, and services easily using smart technology. Our mission is to revolutionize the riding experience by combining cutting-edge artificial intelligence with deep automotive expertise.
          </p>
          <p className="text-muted-foreground mb-12 leading-relaxed">
            Founded by passionate riders and tech enthusiasts, MotoMind AI bridges the gap between traditional motorcycle culture and modern technology. Whether you're a seasoned rider or just starting out, our platform provides personalized recommendations, trusted mechanic connections, and a comprehensive parts marketplace — all powered by AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border text-center"
            >
              <s.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-heading font-bold mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
