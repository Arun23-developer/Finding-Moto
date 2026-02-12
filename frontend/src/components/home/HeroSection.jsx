import { Search } from "lucide-react";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full hero-gradient" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl animate-fade-in">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-accent/20 text-accent border border-accent/30">
            #1 Motorcycle Parts Marketplace
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground mb-6 leading-tight">
            Find the Perfect Parts for Your{" "}
            <span className="text-gradient">Ride</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
            Connect with trusted sellers and certified garages. Get quality parts,
            expert services, and everything you need to keep your motorcycle running at its best.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search parts by name, model, or brand..."
                className="w-full h-14 pl-12 pr-4 rounded-lg bg-background/95 backdrop-blur border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button variant="hero" size="xl">
              Search Parts
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-primary-foreground/10">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">50K+</p>
              <p className="text-sm text-primary-foreground/60">Parts Listed</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">2.5K+</p>
              <p className="text-sm text-primary-foreground/60">Partner Garages</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">100K+</p>
              <p className="text-sm text-primary-foreground/60">Happy Riders</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">4.9</p>
              <p className="text-sm text-primary-foreground/60">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
