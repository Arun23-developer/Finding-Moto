import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Loader2, Wrench, Star, Package, Briefcase, MapPin, Phone, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { resolveProductImage, resolveMediaUrl } from "@/lib/imageUrl";

interface Mechanic {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string | null;
  specialization?: string;
  experienceYears?: number;
  workshopLocation?: string;
  workshopName?: string;
  name: string;
}

interface MechanicStats {
  rating: number;
  reviewCount: number;
  serviceCount: number;
  productCount: number;
}

interface Service {
  _id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string | null;
  images: string[];
  brand: string;
  inStock: boolean;
}

interface MechanicProfileResponse {
  mechanic: Mechanic;
  stats: MechanicStats;
  services: Service[];
  products: Product[];
}

const PublicMechanicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<MechanicProfileResponse | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const { data: res } = await api.get(`/public/mechanics/${id}`);
        if (res.success) {
          setProfile(res.data);
        }
      } catch {
        setError("Failed to load mechanic profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-3 text-muted-foreground">Loading mechanic profile...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Mechanic not found"}</p>
            <Button variant="outline" onClick={() => navigate("/services")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <div className="container py-8">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/services")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>

          <section className="panel-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                {profile.mechanic.avatar ? (
                  <img
                    src={resolveMediaUrl(profile.mechanic.avatar, "https://placehold.co/200x200?text=Mechanic")}
                    alt={profile.mechanic.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Wrench className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{profile.mechanic.name}</h1>
                <p className="text-muted-foreground mb-3">
                  by {profile.mechanic.firstName} {profile.mechanic.lastName}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.mechanic.specialization && (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {profile.mechanic.specialization}
                    </span>
                  )}
                  {profile.mechanic.workshopLocation && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {profile.mechanic.workshopLocation}
                    </span>
                  )}
                  {profile.mechanic.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {profile.mechanic.phone}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 w-full md:w-auto">
                <div className="px-4 py-3 rounded-lg bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-bold text-foreground">{profile.stats.rating}</p>
                </div>
                <div className="px-4 py-3 rounded-lg bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="font-bold text-foreground">{profile.stats.reviewCount}</p>
                </div>
                <div className="px-4 py-3 rounded-lg bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Services</p>
                  <p className="font-bold text-foreground">{profile.stats.serviceCount}</p>
                </div>
                <div className="px-4 py-3 rounded-lg bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="font-bold text-foreground">{profile.stats.productCount}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-foreground mb-4">Available Services</h2>
            {profile.services.length === 0 ? (
              <div className="panel-card p-8 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No services listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.services.map((service) => (
                  <div key={service._id} className="panel-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{service.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{service.category} • {service.duration}</p>
                      </div>
                      <p className="font-bold text-foreground">LKR {service.price.toLocaleString()}</p>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">Products by this mechanic</h2>

            {profile.products.length === 0 ? (
              <div className="panel-card p-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No products available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {profile.products.map((product) => {
                  const imageUrl = resolveProductImage(product, "https://placehold.co/400x400?text=No+Image");
                  return (
                    <div
                      key={product._id}
                      className="panel-card-interactive cursor-pointer"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-secondary">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-medium text-accent mb-1">{product.brand}</p>
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">LKR {product.price.toLocaleString()}</span>
                          <span className={`text-xs font-semibold ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                            {product.inStock ? "In stock" : "Out of stock"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicMechanicProfile;
