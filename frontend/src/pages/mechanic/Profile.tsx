import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Edit3,
  Save,
  Camera,
  ShoppingCart,
  Star,
  Eye,
  CheckCircle,
  Shield,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Profile Page ───────────────────────────────────────────────────────────
export default function MechanicProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    workshopName: (user as any)?.workshopName || "Fernando Auto Care",
    specialization: (user as any)?.specialization || "Engine & Transmission",
    experienceYears: (user as any)?.experienceYears || 12,
    workshopDescription: "Expert motorcycle repair and maintenance services. Specializing in engine overhauls, electrical diagnostics, and transmission work. Over a decade of experience with all major motorcycle brands.",
    workshopLocation: (user as any)?.workshopLocation || "78, Main Street, Galle",
    phone: user?.phone || "+94 76 345 6789",
    email: user?.email || "mechanic@findingmoto.lk",
    website: "www.fernandoautocare.lk",
    openHours: "Mon-Sat: 7:30 AM - 6:30 PM",
  });

  const workshopStats = [
    { icon: Wrench, label: "Total Jobs", value: "342", color: "text-amber-600", bg: "bg-amber-600/10" },
    { icon: ShoppingCart, label: "Active Orders", value: "8", color: "text-blue-600", bg: "bg-blue-600/10" },
    { icon: Star, label: "Average Rating", value: "4.7", color: "text-yellow-600", bg: "bg-yellow-600/10" },
    { icon: Eye, label: "Profile Views", value: "1,850", color: "text-purple-600", bg: "bg-purple-600/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workshop Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your workshop details and appearance</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/25"
        >
          {editing ? (
            <><Save className="h-4 w-4" /> Save Changes</>
          ) : (
            <><Edit3 className="h-4 w-4" /> Edit Profile</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workshop Banner & Info */}
          <Card className="glass-card overflow-hidden">
            {/* Banner */}
            <div className="relative h-40 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
              {editing && (
                <button className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
              {/* Workshop logo */}
              <div className="absolute -bottom-8 left-6">
                <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card flex items-center justify-center shadow-lg">
                  <Wrench className="h-10 w-10 text-amber-600" />
                </div>
              </div>
            </div>

            <CardContent className="pt-12 pb-6 px-6">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Workshop Name</label>
                      <input
                        type="text"
                        value={form.workshopName}
                        onChange={(e) => setForm({ ...form, workshopName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Specialization</label>
                      <input
                        type="text"
                        value={form.specialization}
                        onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Location</label>
                      <input
                        type="text"
                        value={form.workshopLocation}
                        onChange={(e) => setForm({ ...form, workshopLocation: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Experience (years)</label>
                      <input
                        type="number"
                        value={form.experienceYears}
                        onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Website</label>
                      <input
                        type="text"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Business Hours</label>
                      <input
                        type="text"
                        value={form.openHours}
                        onChange={(e) => setForm({ ...form, openHours: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Workshop Description</label>
                    <textarea
                      value={form.workshopDescription}
                      onChange={(e) => setForm({ ...form, workshopDescription: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-1">{form.workshopName}</h2>
                  <p className="text-sm text-amber-600 font-semibold mb-1">🔧 {form.specialization} · {form.experienceYears} years experience</p>
                  <p className="text-sm text-muted-foreground mb-4">{form.workshopDescription}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-amber-600" /> {form.workshopLocation}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-amber-600" /> {form.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 text-amber-600" /> {form.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4 text-amber-600" /> {form.website}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <Clock className="h-4 w-4 text-amber-600" /> {form.openHours}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Full Service", "Engine Repair", "Brake Service", "Electrical Diagnostics", "Chain & Sprocket", "Tyre Change", "Clutch Repair", "Suspension Work", "Fuel System", "Carburetor Tuning"].map((svc) => (
                  <span
                    key={svc}
                    className="px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-600 text-xs font-medium"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Brands Serviced */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Brands We Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Honda", "Yamaha", "Suzuki", "Bajaj", "TVS", "KTM", "Kawasaki", "Royal Enfield"].map((brand) => (
                  <div
                    key={brand}
                    className="flex items-center justify-center p-3 rounded-lg border border-border bg-muted/30 text-sm font-medium hover:bg-muted/50 transition-colors"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-600">Verified Mechanic</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since January 2025
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Identity Verified</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Certified Mechanic</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workshop Statistics */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Workshop Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workshopStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Response Rate", value: 96, color: "bg-emerald-500" },
                { label: "Job Completion", value: 94, color: "bg-amber-500" },
                { label: "Customer Satisfaction", value: 93, color: "bg-blue-500" },
                { label: "On-time Completion", value: 89, color: "bg-purple-500" },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-semibold">{metric.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${metric.color} transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
