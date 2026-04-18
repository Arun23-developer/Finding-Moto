import { useEffect, useRef, useState, type ChangeEvent } from "react";
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
  Loader2,
  Plus,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl } from "@/lib/imageUrl";

interface MechanicProfileData {
  workshopName: string;
  specialization: string;
  experienceYears: number;
  workshopDescription: string;
  workshopLocation: string;
  phone: string;
  email: string;
  website: string;
  openHours: string;
  servicesOffered: string[];
}

export default function MechanicProfile() {
  const allBrands = ["Bajaj", "TVS", "Hero", "Honda", "Yamaha", "Suzuki", "KTM", "Kawasaki", "BMW", "Royal Enfield"];
  const defaultBrands = ["Yamaha", "Honda", "Suzuki", "Kawasaki", "KTM", "Bajaj", "TVS", "Royal Enfield"];
  const allServices = [
    "Engine oil change", "Oil filter replacement", "Air filter cleaning", "Air filter replacement", "Chain cleaning",
    "Chain lubrication", "Chain adjustment", "Full bike wash", "General inspection", "Bolt tightening",
    "Engine tuning", "Valve clearance adjustment", "Piston replacement", "Cylinder boring", "Crankshaft repair",
    "Camshaft adjustment", "Timing chain replacement", "Engine overhauling", "Gasket replacement", "Oil seal replacement",
    "Carburetor cleaning", "Carburetor tuning", "Fuel injector cleaning", "Fuel pump repair", "Fuel line cleaning",
    "Throttle body cleaning", "Fuel tank cleaning", "Fuel filter replacement", "Idle adjustment", "Air-fuel ratio tuning",
    "Battery check", "Battery replacement", "Charging system repair", "Alternator repair", "Starter motor repair",
    "Ignition coil replacement", "Spark plug cleaning", "Spark plug replacement", "Wiring repair", "Fuse replacement",
    "Headlight repair", "Indicator repair", "Tail light repair", "Horn repair", "Switch repair",
    "Meter repair", "ECU diagnosis", "Sensor replacement", "LED upgrade installation", "Alarm system installation",
    "Brake pad replacement", "Brake shoe replacement", "Brake disc cleaning", "Brake fluid replacement", "Brake bleeding",
    "Caliper servicing", "Master cylinder repair", "Brake lever adjustment", "ABS diagnosis", "Brake line replacement",
    "Front fork oil change", "Fork seal replacement", "Rear shock repair", "Suspension tuning", "Steering cone set replacement",
    "Handlebar alignment", "Steering adjustment", "Swingarm repair", "Bush replacement", "Linkage lubrication",
    "Tyre replacement", "Tube replacement", "Puncture repair", "Wheel balancing", "Wheel alignment",
    "Rim straightening", "Bearing replacement", "Spoke tightening", "Alloy wheel repair", "Valve replacement",
    "Clutch plate replacement", "Clutch cable adjustment", "Gearbox repair", "Gear oil change", "Sprocket replacement",
    "Chain sprocket kit replacement", "Gear shifting adjustment", "Clutch lever repair", "Transmission inspection", "Kick starter repair",
    "Radiator cleaning", "Coolant replacement", "Water pump repair", "Hose replacement", "Thermostat check",
    "Fairing repair", "Seat repair", "Mirror replacement", "Crash guard installation", "Sticker/decals fitting"
  ];
  
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mechanicBrands, setMechanicBrands] = useState<string[]>(defaultBrands);
  const [brandInput, setBrandInput] = useState("");
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [editingBrands, setEditingBrands] = useState(false);
  const [savingBrands, setSavingBrands] = useState(false);
  const [editingServices, setEditingServices] = useState(false);
  const [serviceInput, setServiceInput] = useState("");
  const [serviceSuggestions, setServiceSuggestions] = useState<string[]>([]);
  const [savingServices, setSavingServices] = useState(false);

  const [form, setForm] = useState<MechanicProfileData>({
    workshopName: "",
    specialization: "",
    experienceYears: 0,
    workshopDescription: "",
    workshopLocation: "",
    phone: "",
    email: "",
    website: "",
    openHours: "Mon-Sat: 7:30 AM - 6:30 PM",
    servicesOffered: [],
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/mechanic/profile");
        const p = data.data;
        setAvatar(p.avatar || user?.avatar || null);
        setMechanicBrands(
          Array.isArray(p.mechanicBrands) && p.mechanicBrands.length > 0
            ? p.mechanicBrands
            : defaultBrands
        );
        setBrandInput("");
        setEditingBrands(false);
        setForm({
          workshopName: p.workshopName || "",
          specialization: p.specialization || "",
          experienceYears: p.experienceYears || 0,
          workshopDescription:
            "Expert motorcycle repair and maintenance services. Keep this section updated with your specialties and what customers can expect.",
          workshopLocation: p.workshopLocation || "",
          phone: p.phone || "",
          email: p.email || "",
          website: "",
          openHours: "Mon-Sat: 7:30 AM - 6:30 PM",
          servicesOffered: p.servicesOffered || (p.specialization ? p.specialization.split(",").map((s: string) => s.trim()) : []),
        });
      } catch (err) {
        console.error("Failed to load mechanic profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.avatar]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: form.phone,
        email: form.email,
        specialization: form.specialization,
        experienceYears: form.experienceYears,
        workshopLocation: form.workshopLocation,
        workshopName: form.workshopName,
        servicesOffered: form.servicesOffered,
      });
      setEditing(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadAvatar(file);
      setAvatar(res.avatar || null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addBrandTag = () => {
    const trimmed = brandInput.trim();
    if (trimmed && !mechanicBrands.includes(trimmed)) {
      setMechanicBrands([...mechanicBrands, trimmed]);
      setBrandInput("");
      setBrandSuggestions([]);
    }
  };

  const selectBrandSuggestion = (brand: string) => {
    if (!mechanicBrands.includes(brand)) {
      setMechanicBrands([...mechanicBrands, brand]);
    }
    setBrandInput("");
    setBrandSuggestions([]);
  };

  const handleBrandInputChange = (value: string) => {
    setBrandInput(value);
    if (value.trim()) {
      const filtered = allBrands.filter(
        (brand) =>
          brand.toLowerCase().includes(value.toLowerCase()) &&
          !mechanicBrands.includes(brand)
      );
      setBrandSuggestions(filtered);
    } else {
      setBrandSuggestions([]);
    }
  };

  const removeBrandTag = (brand: string) => {
    setMechanicBrands(mechanicBrands.filter((b) => b !== brand));
  };

  const addServiceTag = () => {
    const trimmed = serviceInput.trim();
    if (trimmed && !form.servicesOffered.includes(trimmed)) {
      setForm({ ...form, servicesOffered: [...form.servicesOffered, trimmed] });
      setServiceInput("");
      setServiceSuggestions([]);
    }
  };

  const selectServiceSuggestion = (service: string) => {
    if (!form.servicesOffered.includes(service)) {
      setForm({ ...form, servicesOffered: [...form.servicesOffered, service] });
    }
    setServiceInput("");
    setServiceSuggestions([]);
  };

  const handleServiceInputChange = (value: string) => {
    setServiceInput(value);
    if (value.trim()) {
      const filtered = allServices.filter(
        (service) =>
          service.toLowerCase().includes(value.toLowerCase()) &&
          !form.servicesOffered.includes(service)
      );
      setServiceSuggestions(filtered);
    } else {
      setServiceSuggestions([]);
    }
  };

  const removeServiceTag = (service: string) => {
    setForm({ ...form, servicesOffered: form.servicesOffered.filter((s) => s !== service) });
  };

  const saveBrands = async () => {
    setSavingBrands(true);
    try {
      await updateProfile({
        firstName: user?.firstName,
        lastName: user?.lastName,
        mechanicBrands: mechanicBrands,
      });
      setEditingBrands(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save brands");
    } finally {
      setSavingBrands(false);
    }
  };

  const saveServices = async () => {
    setSavingServices(true);
    try {
      await updateProfile({
        firstName: user?.firstName,
        lastName: user?.lastName,
        servicesOffered: form.servicesOffered,
      });
      setEditingServices(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save services");
    } finally {
      setSavingServices(false);
    }
  };

  const workshopStats = [
    { icon: Wrench, label: "Total Jobs", value: "342", color: "text-amber-600", bg: "bg-amber-600/10" },
    { icon: ShoppingCart, label: "Active Orders", value: "8", color: "text-blue-600", bg: "bg-blue-600/10" },
    { icon: Star, label: "Average Rating", value: "4.7", color: "text-yellow-600", bg: "bg-yellow-600/10" },
    { icon: Eye, label: "Profile Views", value: "1,850", color: "text-purple-600", bg: "bg-purple-600/10" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workshop Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your workshop details and appearance</p>
        </div>
        <button
          onClick={() => {
            if (editing) handleSave();
            else setEditing(true);
          }}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/25 disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : editing ? (
            <><Save className="h-4 w-4" /> Save Changes</>
          ) : (
            <><Edit3 className="h-4 w-4" /> Edit Profile</>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="relative h-40 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
              <button
                onClick={handleAvatarPick}
                disabled={uploadingAvatar}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors disabled:opacity-60"
                title="Change profile picture"
              >
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <div className="absolute -bottom-8 left-6">
                <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card flex items-center justify-center shadow-lg overflow-hidden">
                  {avatar ? (
                    <img src={resolveMediaUrl(avatar, "https://placehold.co/120x120?text=Mech")} alt="Mechanic profile" className="w-full h-full object-cover" />
                  ) : (
                    <Wrench className="h-10 w-10 text-amber-600" />
                  )}
                </div>
              </div>
            </div>

            <CardContent className="pt-12 pb-6 px-6">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Workshop Name</label>
                      <input type="text" value={form.workshopName} onChange={(e) => setForm({ ...form, workshopName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Specialization</label>
                      <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Location</label>
                      <input type="text" value={form.workshopLocation} onChange={(e) => setForm({ ...form, workshopLocation: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Experience (years)</label>
                      <input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Website</label>
                      <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Business Hours</label>
                      <input type="text" value={form.openHours} onChange={(e) => setForm({ ...form, openHours: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Workshop Description</label>
                    <textarea value={form.workshopDescription} onChange={(e) => setForm({ ...form, workshopDescription: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Services Offered (comma separated)</label>
                    <input 
                      type="text" 
                      value={form.servicesOffered.join(", ")} 
                      onChange={(e) => setForm({ ...form, servicesOffered: e.target.value.split(",").map(s => s.trim()).filter(s => s) })} 
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" 
                      placeholder="e.g., Engine & Transmission, Brakes, Suspension"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter services separated by commas</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-1">{form.workshopName || "My Workshop"}</h2>
                  <p className="text-sm text-amber-600 font-semibold mb-1">🔧 {form.specialization || "General Service"} · {form.experienceYears} years experience</p>
                  <p className="text-sm text-muted-foreground mb-4">{form.workshopDescription}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-amber-600" /> {form.workshopLocation || "-"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 text-amber-600" /> {form.phone || "-"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 text-amber-600" /> {form.email || "-"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4 text-amber-600" /> {form.website || "-"}</div>
                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2"><Clock className="h-4 w-4 text-amber-600" /> {form.openHours}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Services Offered</CardTitle>
                {!editingServices && (
                  <button onClick={() => setEditingServices(true)} className="text-amber-600 hover:text-amber-700 text-sm font-medium">Edit</button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingServices ? (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={serviceInput}
                        onChange={(e) => handleServiceInputChange(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addServiceTag()}
                        placeholder="Enter service name (e.g., Engine Repair)"
                        className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <button
                        onClick={addServiceTag}
                        className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                    {serviceSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-12 mt-1 bg-background border border-input rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {serviceSuggestions.map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => selectServiceSuggestion(service)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors border-b border-input last:border-b-0"
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.servicesOffered.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-600 text-xs font-medium flex items-center gap-2"
                      >
                        {service}
                        <button
                          onClick={() => removeServiceTag(service)}
                          className="hover:text-amber-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveServices}
                      disabled={savingServices}
                      className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {savingServices ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingServices(false)}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(form.servicesOffered && form.servicesOffered.length > 0 ? form.servicesOffered : ["General Service"]).map((svc) => (
                    <span key={svc} className="px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-600 text-xs font-medium">{svc}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Brands We Stock</CardTitle>
                {!editingBrands && (
                  <button onClick={() => setEditingBrands(true)} className="text-amber-600 hover:text-amber-700 text-sm font-medium">Edit</button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingBrands ? (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={brandInput}
                        onChange={(e) => handleBrandInputChange(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addBrandTag()}
                        placeholder="Enter brand name (e.g., Yamaha)"
                        className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <button
                        onClick={addBrandTag}
                        className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                    {brandSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-12 mt-1 bg-background border border-input rounded-lg shadow-lg z-10">
                        {brandSuggestions.map((brand) => (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => selectBrandSuggestion(brand)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors border-b border-input last:border-b-0"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mechanicBrands.map((brand) => (
                      <span
                        key={brand}
                        className="px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-600 text-xs font-medium flex items-center gap-2"
                      >
                        {brand}
                        <button
                          onClick={() => removeBrandTag(brand)}
                          className="hover:text-amber-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveBrands}
                      disabled={savingBrands}
                      className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {savingBrands ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingBrands(false)}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mechanicBrands.map((brand) => (
                    <span key={brand} className="px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-600 text-xs font-medium">
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-emerald-600">Verified Mechanic</h3>
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

          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Workshop Statistics</CardTitle></CardHeader>
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
        </div>
      </div>
    </div>
  );
}
