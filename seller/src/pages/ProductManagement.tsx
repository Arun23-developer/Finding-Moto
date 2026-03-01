import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Edit, Trash2, Package, Upload, X, Link as LinkIcon, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProducts,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  uploadImage,
  resolveImageUrl,
  type Product,
  type ProductFormData,
} from "@/services/api";

const CATEGORIES = [
  "Brakes",
  "Filters",
  "Ignition",
  "Fluids",
  "Lighting",
  "Engine",
  "Suspension",
  "Electrical",
  "Body Parts",
  "Tires",
  "Accessories",
  "Other",
];

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: 0,
  originalPrice: undefined,
  stock: 0,
  images: [],
  sku: "",
};

export default function ProductManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm });
  const [imageUrl, setImageUrl] = useState(""); // for pasting URL
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch products ─────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchProducts({ page, limit: 20, search: search || undefined });
      setProducts(res.data.data);
      setTotalPages(res.data.meta.pages);
      setTotal(res.data.meta.total);
    } catch (err: unknown) {
      console.error("Failed to load products", err);
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Form helpers ───────────────────────────────────────────────────────
  const openAddDialog = () => {
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setImageUrl("");
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      images: [...product.images],
      sku: product.sku || "",
    });
    setImageUrl("");
    setDialogOpen(true);
  };

  const updateFormField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Image handling ─────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), url] }));
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload image", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), trimmed] }));
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  // ── Submit (create / update) ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.category || form.price <= 0) {
      toast({ title: "Validation", description: "Name, category, and price are required", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      if (editingProduct) {
        await updateProductApi(editingProduct._id, form);
        toast({ title: "Product updated" });
      } else {
        await createProduct(form);
        toast({ title: "Product created" });
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const confirmDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setDeleting(true);
      await deleteProductApi(deletingProduct._id);
      toast({ title: "Product deleted" });
      setDeleteDialogOpen(false);
      loadProducts();
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your spare parts inventory{total > 0 && ` · ${total} products`}
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground shadow-primary" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">No products found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search ? "Try a different search term" : "Add your first product to get started"}
          </p>
        </div>
      )}

      {/* Products grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p._id} className="bg-card rounded-xl card-shadow hover:card-shadow-hover transition-shadow p-5">
                <div className="flex items-start justify-between">
                  {/* Product image */}
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {p.images.length > 0 ? (
                      <img
                        src={resolveImageUrl(p.images[0])}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-2xl">📦</span>';
                        }}
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEditDialog(p)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => confirmDelete(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mt-3">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.sku ? `SKU: ${p.sku} · ` : ""}
                  {p.category}
                  {p.brand ? ` · ${p.brand}` : ""}
                </p>
                {p.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-display font-bold text-primary">${p.price.toFixed(2)}</span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.status === "out_of_stock" || p.stock <= 0
                        ? "bg-destructive/10 text-destructive"
                        : p.stock <= 5
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {p.stock <= 0 ? "Out of stock" : `${p.stock} in stock`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Name */}
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => updateFormField("name", e.target.value)}
                placeholder="e.g. Brake Pads - Premium"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => updateFormField("description", e.target.value)}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            {/* SKU + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={form.sku || ""}
                  onChange={(e) => updateFormField("sku", e.target.value)}
                  placeholder="BP-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => updateFormField("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                value={form.brand || ""}
                onChange={(e) => updateFormField("brand", e.target.value)}
                placeholder="e.g. Bosch"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price || ""}
                  onChange={(e) => updateFormField("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock ?? ""}
                  onChange={(e) => updateFormField("stock", parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Original price */}
            <div className="space-y-2">
              <Label>Original Price (optional, for discount display)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice ?? ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateFormField("originalPrice", isNaN(val) ? undefined : val);
                }}
                placeholder="0.00"
              />
            </div>

            {/* ── Images Section ────────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label>Product Images</Label>

              {/* Current images */}
              {(form.images?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images!.map((img, i) => (
                    <div key={i} className="relative group h-20 w-20 rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Product ${i + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            '<div class="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Error</div>';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload file */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                ) : (
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {uploading ? "Uploading..." : "Click to upload image"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Or paste URL */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addImageUrl} disabled={!imageUrl.trim()}>
                  <ImageIcon className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
