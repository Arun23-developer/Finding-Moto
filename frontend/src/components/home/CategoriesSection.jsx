import { Link } from "react-router-dom";
import {
  Cog,
  Gauge,
  Shield,
  Wrench,
  Zap,
  Bike,
  Sparkles,
  CircleDot,
} from "lucide-react";

const categories = [
  {
    name: "Engine Parts",
    description: "Pistons, cylinders, gaskets & more",
    icon: Cog,
    href: "/products?category=engine",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Brakes & Suspension",
    description: "Pads, rotors, shocks & forks",
    icon: CircleDot,
    href: "/products?category=brakes",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Electronics",
    description: "Batteries, lights & wiring",
    icon: Zap,
    href: "/products?category=electronics",
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "Performance",
    description: "Exhaust, intake & tuning",
    icon: Gauge,
    href: "/products?category=performance",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Body & Frame",
    description: "Fairings, tanks & guards",
    icon: Shield,
    href: "/products?category=body",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Tools & Maintenance",
    description: "Oils, cleaners & equipment",
    icon: Wrench,
    href: "/products?category=tools",
    color: "from-slate-500 to-zinc-500",
  },
  {
    name: "Accessories",
    description: "Luggage, mirrors & grips",
    icon: Sparkles,
    href: "/products?category=accessories",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Gear & Apparel",
    description: "Helmets, jackets & gloves",
    icon: Bike,
    href: "/products?category=gear",
    color: "from-indigo-500 to-violet-500",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need from our extensive catalog of motorcycle parts and accessories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={category.href}
              className="group relative p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${category.color} mb-4`}>
                <category.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <div className="absolute inset-0 rounded-xl border-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
