import { Link } from "react-router-dom";
import { Zap, Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="container mx-auto section-padding">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-lg">
              Moto<span className="text-primary">Mind</span> AI
            </span>
          </Link>
          <p className="text-sm text-muted-foreground mb-4">
            AI-driven automobile platform helping riders find bikes, parts, mechanics, and services.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["Home", "Products", "Services", "About", "Contact"].map((l) => (
              <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Services</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Bike Servicing</span>
            <span>Engine Repair</span>
            <span>Brake & Suspension</span>
            <span>Custom Mods</span>
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-3">Get the latest updates on bikes and offers.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 MotoMind AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
