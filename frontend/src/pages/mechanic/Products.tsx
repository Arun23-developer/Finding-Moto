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
  createdAt: string;
}

const categories = ["All", "Bikes", "Brakes", "Lubricants", "Engine Parts", "Drive", "Filters", "Cables", "Electrical", "Accessories"];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "In Stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" },
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
  });
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      });
      setImages(product?.images || []);
    }
  }, [open, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/products/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) setImages((prev) => [...prev, data.data.url]);
    } catch {
      /* ignore */
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) return;
    setSaving(true);
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
      };
      if (product) {
        await api.put(`/products/${product._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      onSaved();
      onClose();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            {product ? "Edit Part" : "Add New Part"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Product Images</label>
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={resolveMediaUrl(img, "https://placehold.co/80x80?text=Item")} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer w-full"
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop images here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each. Max 5 images.</p>
            </button>
          </div>

          {/* Two-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Part Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Brake Pad Set - Universal"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g., BRK-BDX-001"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="">Select category</option>
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g., NGK, Motul"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (LKR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Original Price (LKR)</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stock Quantity *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the spare part, compatibility, condition..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/25 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : product ? "Save Changes" : "Add Part"}
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
            <h3 className="text-lg font-bold">Delete Part</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm mb-6">
          Are you sure you want to delete <strong>{productName}</strong>? This will permanently remove it from your inventory.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products Page ──────────────────────────────────────────────────────────
export default function MechanicProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setError("");
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const { data } = await api.get("/products", { params });
      setProducts(data.data || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteProduct._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteProduct._id));
      setDeleteProduct(null);
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const activeCount = products.filter((p) => p.status === "active").length;
  const outOfStockCount = products.filter((p) => p.status === "out_of_stock").length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-amber-600" />
        <p className="text-sm font-medium">Loading inventory…</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-3 text-red-500" />
        <p className="font-medium">{error}</p>
        <button onClick={fetchProducts} className="mt-3 inline-flex items-center gap-2 text-sm text-amber-600 hover:underline">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Spare Parts & Inventory</h1>
          <p className="text-sm text-muted-foreground">{products.length} total parts in inventory</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/25"
        >
          <Plus className="h-4 w-4" /> Add Part
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border p-4 bg-card">
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-xs text-muted-foreground">Total Parts</p>
        </div>
        <div className="rounded-lg border p-4 bg-emerald-50 dark:bg-emerald-950/20">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">In Stock</p>
        </div>
        <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20">
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
        <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
          <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {["all", "active", "inactive", "out_of_stock"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    statusFilter === s
                      ? "bg-amber-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {s === "all" ? "All" : s === "out_of_stock" ? "Out of Stock" : s === "active" ? "In Stock" : "Inactive"}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium">Part</th>
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
                        <div className="w-10 h-10 rounded-lg bg-amber-600/10 flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={resolveMediaUrl(product.images[0], "https://placehold.co/80x80?text=Item")} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-amber-600/50" />
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
                      <span className={cn(
                        "font-semibold",
                        product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} units`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{(product.views || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{product.sales || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[product.status]?.color || ""}`}>
                        {statusConfig[product.status]?.label || product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/30 text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProduct(product)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No parts found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProductModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={fetchProducts}
      />
      <ProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onSaved={fetchProducts}
      />
      <DeleteModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        productName={deleteProduct?.name || ""}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
