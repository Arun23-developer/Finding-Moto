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
}

export default function MechanicProfile() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/mechanic/profile");
        const p = data.data;
        setAvatar(p.avatar || user?.avatar || null);
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
        specialization: form.specialization,
        experienceYears: form.experienceYears,
        workshopLocation: form.workshopLocation,
        workshopName: form.workshopName,
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
                      <input type="email" value={form.email} disabled className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-sm" />
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
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Services Offered</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(form.specialization ? form.specialization.split(",").map((s) => s.trim()) : ["General Service"]).map((svc) => (
                  <span key={svc} className="px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-600 text-xs font-medium">{svc}</span>
                ))}
              </div>
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
