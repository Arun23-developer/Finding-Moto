import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroBike1 from "@/assets/hero-bike-1.jpg";
import heroBike2 from "@/assets/hero-bike-2.jpg";
import heroBike3 from "@/assets/hero-bike-3.jpg";
import heroBike4 from "@/assets/hero-bike-4.jpg";
import heroBike5 from "@/assets/hero-bike-5.jpg";

const heroImages = [heroBike1, heroBike2, heroBike3, heroBike4, heroBike5];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="relative h-screen h-[100svh] w-full overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: direction * 48, scale: 1.02 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -direction * 48, scale: 1.01 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={heroImages[current]}
            alt="Hero motorcycle"
            className="h-full w-full select-none object-cover object-center"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4 pt-16 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl drop-shadow-lg"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            AI-Powered Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-black leading-tight mb-6">
            Powering the <span className="text-gradient">Future</span> of Riding
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8">
            Discover bikes, parts, trusted mechanics, and smart AI recommendations in one platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity neon-glow-orange"
            >
              Explore Bikes <ChevronRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors">
              <MessageCircle className="h-4 w-4" /> Chat with AI
            </button>
          </div>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-4 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
