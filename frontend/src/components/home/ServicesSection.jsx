import { MapPin, Star, Clock, Phone, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const featuredGarages = [
  {
    id: "1",
    name: "Velocity Moto Works",
    address: "2847 Sunset Blvd, Los Angeles, CA",
    rating: 4.9,
    reviewCount: 312,
    hours: "Mon-Sat: 8AM-6PM",
    phone: "(310) 555-0123",
    services: ["Full Service", "Custom Builds", "Performance Tuning"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Iron Horse Garage",
    address: "1523 Main Street, Santa Monica, CA",
    rating: 4.7,
    reviewCount: 245,
    hours: "Mon-Fri: 9AM-5PM",
    phone: "(310) 555-0456",
    services: ["Oil Change", "Tire Service", "Diagnostics"],
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Speed Demons Workshop",
    address: "789 Harbor Way, Long Beach, CA",
    rating: 4.8,
    reviewCount: 189,
    hours: "Tue-Sun: 10AM-7PM",
    phone: "(562) 555-0789",
    services: ["Racing Setup", "Suspension", "Engine Rebuild"],
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&h=400&fit=crop",
  },
];

export function ServicesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Trusted Garages Near You
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Connect with certified mechanics and service centers for professional maintenance and repairs
            </p>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <Link to="/services">
              View All Garages
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredGarages.map((garage, index) => (
            <div
              key={garage.id}
              className="group bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={garage.image}
                  alt={garage.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-semibold">{garage.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {garage.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{garage.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{garage.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{garage.phone}</span>
                  </div>
                </div>

                {/* Services Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {garage.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <Button variant="accent" className="w-full">
                  Book Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="mt-12 rounded-xl overflow-hidden border border-border bg-secondary h-64 md:h-80 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">Interactive Map Coming Soon</p>
            <p className="text-sm text-muted-foreground">Find garages, parts stores, and service centers in your area</p>
          </div>
        </div>
      </div>
    </section>
  );
}
