import React, { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Search,
  MapPin,
  Phone,
  CheckCircle,
  Calendar,
  Loader2,
  Wrench,
} from "lucide-react";
import api from "../services/api";

interface ServiceDetail {
  name: string;
  category: string;
  price: number;
}

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
  serviceDetails: ServiceDetail[];
  verified: boolean;
}

const Services: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("All Services");

  const [garages, setGarages] = useState<Garage[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>(["All Services"]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchMechanics = async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedService !== "All Services") params.specialization = selectedService;

      const { data: res } = await api.get("/public/mechanics", { params });

      if (res.success) {
        setGarages(res.data);
        if (res.filters?.specializations) {
          setServiceTypes(res.filters.specializations);
        }
      }
    } catch (err) {
      console.error("Failed to fetch mechanics:", err);
      setError("Failed to load service centers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMechanics();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const filteredGarages = garages;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-black text-primary-foreground mb-6">
                Find Trusted Garages Near You
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Connect with certified mechanics and service centers for professional maintenance and repairs
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your location or zip code..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-background/95 backdrop-blur border-0"
                  />
                </div>
                <Button variant="hero" size="xl">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 bg-secondary border-b border-border">
          <div className="container">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-foreground">Filter by service:</span>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((service) => (
                  <button
                    key={service}
                    onClick={() => setSelectedService(service)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedService === service
                        ? "bg-accent text-accent-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Garage Listings */}
        <section className="py-12">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                Showing {filteredGarages.length} garages near you
              </p>
              <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option>Nearest First</option>
                <option>Best Rated</option>
                <option>Most Reviews</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loading State */}
              {loading && garages.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <span className="ml-3 text-muted-foreground">Loading service centers...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="col-span-full text-center py-20">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button variant="outline" onClick={() => fetchMechanics()}>Try Again</Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredGarages.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No service centers found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}

              {filteredGarages.map((garage, index) => (
                <div
                  key={garage._id}
                  className="group bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {garage.verified && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-600/90 text-white text-xs font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {garage.experienceYears > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-medium">
                        {garage.experienceYears}+ yrs exp
                      </div>
                    )}
                  </div>

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

                    <div className="flex flex-wrap gap-2 mb-4">
                      {garage.serviceDetails && garage.serviceDetails.length > 0 ? (
                        <>
                          {garage.serviceDetails.slice(0, 3).map((svc) => (
                            <span key={svc.name} className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground" title={`LKR ${svc.price.toLocaleString()}`}>
                              {svc.name}
                            </span>
                          ))}
                          {garage.serviceDetails.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                              +{garage.serviceDetails.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {garage.services.slice(0, 3).map((service) => (
                            <span key={service} className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                              {service}
                            </span>
                          ))}
                          {garage.services.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                              +{garage.services.length - 3} more
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="accent" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                      <Button variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">Load More Garages</Button>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-secondary">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground mb-6">Explore on Map</h2>
            <div className="rounded-xl overflow-hidden border border-border bg-card h-80 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">Interactive Map Coming Soon</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Explore garages, view their locations, and get directions all from the map view
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Own a Garage?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join Finding Moto to reach thousands of riders looking for quality service.
              Get more bookings and grow your business.
            </p>
            <Button variant="hero" size="xl">Register Your Garage</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
