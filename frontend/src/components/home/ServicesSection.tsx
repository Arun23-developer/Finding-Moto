import { useState, useEffect } from "react";
import { MapPin, Phone, ArrowRight, Loader2, Wrench } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

interface Garage {
  _id: string;
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  avatar: string | null;
  services: string[];
  verified: boolean;
}

export const ServicesSection: React.FC = () => {
  const navigate = useNavigate();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const { data: res } = await api.get("/public/mechanics");
        if (res.success) {
          // Only show first 3 on homepage
          setGarages(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch mechanics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGarages();
  }, []);
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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">Loading service centers...</span>
          </div>
        ) : garages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No service centers available yet. Check back soon!</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {garages.map((garage, index) => (
            <div
              key={garage._id}
              className="group bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image / Avatar */}
              <div className="relative h-48 overflow-hidden bg-secondary flex items-center justify-center">
                {garage.avatar ? (
                  <img
                    src={garage.avatar.startsWith("http") ? garage.avatar : `${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${garage.avatar}`}
                    alt={garage.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Wrench className="h-12 w-12 mb-2" />
                    <span className="text-sm font-medium">{garage.specialization}</span>
                  </div>
                )}
                {garage.experienceYears > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur">
                  <span className="text-sm font-semibold">{garage.experienceYears}+ yrs</span>
                </div>
                )}
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
                    <Wrench className="h-4 w-4 shrink-0" />
                    <span>By {garage.ownerName}</span>
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

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/mechanic/${garage._id}`)}>
                    View Profile
                  </Button>
                  <Button variant="accent" className="flex-1" asChild>
                    <Link to="/services">Book</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

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
};
