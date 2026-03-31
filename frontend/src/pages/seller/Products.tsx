import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { resolveMediaUrl } from "@/lib/imageUrl";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  status: "active" | "inactive" | "out_of_stock";
  views: number;
  sales: number;
  sku: string;
  type?: "product" | "service";
  createdAt: string;
}

const productCategories = [
  "engine_system/piston",
  "engine_system/cylinder_block",
  "engine_system/crankshaft",
  "engine_system/camshaft",
  "engine_system/spark_plug",
  "fuel_system/fuel_injector",
  "fuel_system/fuel_tank",
  "fuel_system/fuel_pump",
  "fuel_system/fuel_filter",
  "brake_system/brake_disc",
  "brake_system/brake_pad",
  "brake_system/brake_caliper",
  "transmission_system/clutch_plate",
  "transmission_system/chain_sprocket",
  "transmission_system/drive_chain",
  "suspension_system/front_fork",
  "suspension_system/rear_shock_absorber",
  "suspension_system/swing_arm",
  "electrical_system/battery",
  "electrical_system/headlight",
  "electrical_system/ecu",
  "electrical_system/starter_motor",
  "electrical_system/wiring_harness",
  "electrical_system/indicators",
  "body_parts/seat",
  "body_parts/mirrors",
  "body_parts/mudguard",
  "body_parts/side_panel",
  "body_parts/number_plate_holder",
  "wheels/tyre",
  "wheels/rim",
  "wheels/spokes",
];
const categories = ["All", ...productCategories];

const formatCategoryLabel = (value: string): string => {
  if (!value.includes("/")) return value;
  const [parent, child] = value.split("/");
  const toTitle = (part: string) =>
    part
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return `${toTitle(parent)} / ${toTitle(child)}`;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" },
  out_of_stock: { label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800" },
};

// ─── Add/Edit Product Modal ─────────────────────────────────────────────────
interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  price: string;
  originalPrice: string;
  stock: string;
  sku: string;
  description: string;
  type: "product";
}

function ProductModal({
  open,
  onClose,
  product,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    category: "",
    brand: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    description: "",
    type: "product",
  });
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCategories = productCategories;

  // Reset form when product changes
  useEffect(() => {
    if (open) {
      setForm({
        name: product?.name || "",
        category: product?.category || "",
        brand: product?.brand || "",
        price: product?.price?.toString() || "",
        originalPrice: product?.originalPrice?.toString() || "",
        stock: product?.stock?.toString() || "",
        sku: product?.sku || "",
        description: product?.description || "",
        type: "product",
      });
      setImages(product?.images || []);
      setImageUrlInput("");
      setError(null);
    }
  }, [open, product]);

  const handleAddImageUrl = () => {
    const raw = imageUrlInput.trim();
    if (!raw) return;

    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("Image URL must start with http:// or https://");
        return;
      }

      setImages((prev) => {
        if (prev.includes(raw)) return prev;
        return [...prev, raw];
      });
      setImageUrlInput("");
      setError(null);
    } catch {
      setError("Please enter a valid image URL");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await api.post("/products/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          setImages((prev) => [...prev, res.data.data.url]);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      setError("Please fill all required fields (name, category, price, stock)");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        brand: form.brand,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        sku: form.sku,
        description: form.description,
        images,
        type: "product",
      };

      if (product) {
        await api.put(`/products/${product._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Product Images</label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                    <img src={resolveMediaUrl(img, "https://placehold.co/80x80?text=Item")} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 mx-auto text-blue-600 mb-3 animate-spin" />
              ) : (
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              )}
              <p className="text-sm font-medium">{uploading ? "Uploading..." : "Drop images here or click to upload"}</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each. Max 5 images.</p>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Two-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Brake Pad Set - Honda" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">SKU / Code</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g., BRK-HND-001" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="">Select category</option>
                {currentCategories.map((c) => (<option key={c} value={c}>{formatCategoryLabel(c)}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Brand</label>
              <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g., Honda, Yamaha" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (LKR) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Original Price (LKR)</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="0.00" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stock Quantity *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteModal({
  open,
  onClose,
  productName,
  onConfirm,
  deleting,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  onConfirm: () => void;
  deleting: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Delete Product</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm mb-6">
          Are you sure you want to delete <strong>{productName}</strong>? This will permanently remove it from your listings.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products Page ──────────────────────────────────────────────────────────
export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      params.type = "product";
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get("/products", { params });
      const data = res.data.data || [];
      setProducts(data.filter((p: Product) => p.type !== "service"));
    } catch (err: any) {
      setProducts([]);
      setError(err?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchCategory;
  });

  const activeCount = products.filter((p) => p.status === "active").length;
  const outOfStockCount = products.filter((p) => p.status === "out_of_stock").length;
  const productCount = products.filter((p) => p.type !== "service").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={fetchProducts} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
        <button onClick={() => setAddModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border p-4 bg-card">
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-xs text-muted-foreground">All</p>
        </div>
        <div className="rounded-lg border p-4 bg-emerald-50 dark:bg-emerald-950/20">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20">
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["all", "active", "out_of_stock"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", statusFilter === s ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  {s === "all" ? "All" : s === "out_of_stock" ? "Out of Stock" : "Stock"}
                </button>
              ))}
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              {categories.map((c) => (<option key={c} value={c}>{formatCategoryLabel(c)}</option>))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchProducts} className="ml-auto text-sm font-medium underline">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Stock</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Views</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Sales</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={resolveMediaUrl(product.images[0])} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-lg">📦</span>'; }} />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">{product.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">LKR {product.price.toLocaleString()}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">LKR {product.originalPrice.toLocaleString()}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("font-semibold", product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-emerald-600")}>
                          {product.stock === 0 ? "Out of Stock" : `${product.stock} units`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{product.views?.toLocaleString() || 0}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{product.sales || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[product.status]?.color || statusConfig.active.color}`}>
                          {statusConfig[product.status]?.label || product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditProduct(product)} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 text-blue-600 transition-colors" title="Edit">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(product)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !error && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No products found</p>
                        <p className="text-xs mt-1">{products.length === 0 ? "Add your first product to get started" : "Try adjusting your search or filters"}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ProductModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSaved={fetchProducts} />
      <ProductModal open={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onSaved={fetchProducts} />
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} productName={deleteTarget?.name || ""} onConfirm={handleDelete} deleting={deleting} />
    </div>
  );
}
