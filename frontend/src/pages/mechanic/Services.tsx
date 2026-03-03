import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  active: boolean;
}

const CATEGORIES = ["All", "General", "Engine", "Brakes", "Electrical", "Tyres", "Transmission", "Suspension"];

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  duration: "",
  category: "General",
  active: true,
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function MechanicServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ── Fetch services from backend ──
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data: res } = await api.get("/mechanic/services");
      if (res.success) {
        setServices(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Stats
  const activeCount = services.filter((s) => s.active).length;
  const totalServices = services.length;
  const avgPrice = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0;

  // Filtered services
  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (svc: Service) => {
    setForm({ name: svc.name, description: svc.description, price: svc.price, duration: svc.duration, category: svc.category, active: svc.active });
    setEditingId(svc._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.duration.trim() || form.price <= 0) return;

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        // Update existing service
        const { data: res } = await api.put(`/mechanic/services/${editingId}`, form);
        if (res.success) {
          setServices((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
        }
      } else {
        // Create new service
        const { data: res } = await api.post("/mechanic/services", form);
        if (res.success) {
          setServices((prev) => [res.data, ...prev]);
        }
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error("Save service error:", err);
      setError(err.response?.data?.message || "Failed to save service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError("");
      const { data: res } = await api.delete(`/mechanic/services/${id}`);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err: any) {
      console.error("Delete service error:", err);
      setError(err.response?.data?.message || "Failed to delete service.");
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (id: string) => {
    const svc = services.find((s) => s._id === id);
    if (!svc) return;
    try {
      setError("");
      const { data: res } = await api.put(`/mechanic/services/${id}`, { active: !svc.active });
      if (res.success) {
        setServices((prev) => prev.map((s) => (s._id === id ? res.data : s)));
      }
    } catch (err: any) {
      console.error("Toggle active error:", err);
      setError(err.response?.data?.message || "Failed to update service.");
    }
  };

  const formatPrice = (n: number) => `LKR ${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage the repair and maintenance services offered by{" "}
            {(user as any)?.workshopName || "your workshop"}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/25"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Services", value: totalServices, icon: Wrench, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-t-amber-500" },
          { label: "Active Services", value: activeCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-600/10", border: "border-t-emerald-500" },
          { label: "Avg. Price", value: formatPrice(avgPrice), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-600/10", border: "border-t-blue-500" },
        ].map((kpi) => (
          <Card key={kpi.label} className={cn("glass-card border-t-4", kpi.border)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors",
                filterCategory === cat
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-background text-muted-foreground border-border hover:bg-muted/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Add / Edit Service Form ── */}
      {showForm && (
        <Card className="glass-card border-2 border-amber-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {editingId ? "Edit Service" : "Add New Service"}
              </CardTitle>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Service Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Full Motorcycle Service"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {/* Price */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (LKR) *</label>
                <input
                  type="number"
                  min={0}
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              {/* Duration */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated Duration *</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 2-3 hours"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what this service includes..."
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
              />
            </div>
            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, active: !form.active })}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  form.active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                    form.active && "translate-x-5"
                  )}
                />
              </button>
              <span className="text-sm font-medium">{form.active ? "Active" : "Inactive"}</span>
            </div>
            {/* Save button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.duration.trim() || form.price <= 0 || saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-amber-600/25"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {editingId ? "Update Service" : "Add Service"}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Services List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="ml-3 text-muted-foreground">Loading services...</span>
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((svc) => (
            <Card key={svc._id} className={cn("glass-card transition-all", !svc.active && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                      svc.active ? "bg-amber-100 dark:bg-amber-950/30" : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <Wrench className={cn("h-5 w-5", svc.active ? "text-amber-600" : "text-gray-400")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{svc.name}</h3>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                          svc.active
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700"
                            : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
                        )}>
                          {svc.active ? <CheckCircle className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                          {svc.active ? "Active" : "Inactive"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                          {svc.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{svc.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <DollarSign className="h-3 w-3" /> {formatPrice(svc.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {svc.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(svc._id)}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        svc.active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      title={svc.active ? "Deactivate" : "Activate"}
                    >
                      <span className={cn(
                        "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                        svc.active && "translate-x-5"
                      )} />
                    </button>
                    <button
                      onClick={() => openEditForm(svc)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-amber-600"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {deleteConfirm === svc._id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(svc._id)}
                          className="px-2 py-1 text-[10px] font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-[10px] font-medium rounded border border-border hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(svc._id)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-4">
                <Wrench className="h-7 w-7 text-amber-600" />
              </div>
              <p className="text-sm font-semibold">No services found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || filterCategory !== "All"
                  ? "Try adjusting your search or filter."
                  : "Add your first service to get started."}
              </p>
              {!searchQuery && filterCategory === "All" && (
                <button
                  onClick={openAddForm}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </div>
  );
}
