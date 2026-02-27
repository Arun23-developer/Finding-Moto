import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  X,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: "1", name: "Brake Pad Set - Toyota Corolla", category: "Brakes", brand: "Toyota", price: 4500, originalPrice: 5200, stock: 15, status: "active" as const, views: 342, sales: 42, sku: "BRK-TOY-001", image: "🔧", createdAt: "2025-12-15" },
  { id: "2", name: "Oil Filter - Honda Civic", category: "Engine Parts", brand: "Honda", price: 1200, stock: 52, status: "active" as const, views: 287, sales: 38, sku: "OIL-HON-002", image: "⚙️", createdAt: "2025-11-28" },
  { id: "3", name: "Headlight Assembly - Universal", category: "Electrical", brand: "Universal", price: 12800, stock: 8, status: "active" as const, views: 198, sales: 24, sku: "HLT-UNI-003", image: "💡", createdAt: "2025-12-01" },
  { id: "4", name: "Spark Plugs Set (4pc)", category: "Engine Parts", brand: "NGK", price: 3200, stock: 30, status: "active" as const, views: 256, sales: 35, sku: "SPK-NGK-004", image: "⚡", createdAt: "2025-12-10" },
  { id: "5", name: "Air Filter - Suzuki Swift", category: "Engine Parts", brand: "Suzuki", price: 1800, stock: 0, status: "out_of_stock" as const, views: 145, sales: 18, sku: "AIR-SUZ-005", image: "🌀", createdAt: "2025-11-20" },
  { id: "6", name: "Radiator Hose Kit", category: "Cooling", brand: "Generic", price: 2800, stock: 22, status: "active" as const, views: 123, sales: 12, sku: "RAD-GEN-006", image: "🔴", createdAt: "2025-12-05" },
  { id: "7", name: "Timing Belt - Mitsubishi", category: "Engine Parts", brand: "Mitsubishi", price: 6500, stock: 5, status: "active" as const, views: 89, sales: 8, sku: "TMB-MIT-007", image: "🔗", createdAt: "2025-10-15" },
  { id: "8", name: "Clutch Kit - Nissan", category: "Transmission", brand: "Nissan", price: 15000, stock: 3, status: "inactive" as const, views: 67, sales: 5, sku: "CLT-NIS-008", image: "🔩", createdAt: "2025-09-20" },
];

const categories = ["All", "Brakes", "Engine Parts", "Electrical", "Cooling", "Transmission"];

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
}

function ProductModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product?: typeof MOCK_PRODUCTS[0] | null;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name || "",
    category: product?.category || "",
    brand: product?.brand || "",
    price: product?.price?.toString() || "",
    originalPrice: product?.originalPrice?.toString() || "",
    stock: product?.stock?.toString() || "",
    sku: product?.sku || "",
    description: "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            {product ? "Edit Product" : "Add New Product"}
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
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop images here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each. Max 5 images.</p>
            </div>
          </div>

          {/* Two-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Brake Pad Set - Toyota"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g., BRK-TOY-001"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
                placeholder="e.g., Toyota, Honda"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (LKR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Original Price (LKR)</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stock Quantity *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
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
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25">
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
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
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
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products Page ──────────────────────────────────────────────────────────
export default function SellerProducts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const activeCount = MOCK_PRODUCTS.filter((p) => p.status === "active").length;
  const outOfStockCount = MOCK_PRODUCTS.filter((p) => p.status === "out_of_stock").length;
  const lowStockCount = MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{MOCK_PRODUCTS.length} total spare parts listed</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border p-4 bg-card">
          <p className="text-2xl font-bold">{MOCK_PRODUCTS.length}</p>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </div>
        <div className="rounded-lg border p-4 bg-emerald-50 dark:bg-emerald-950/20">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {s === "all" ? "All" : s === "out_of_stock" ? "Out of Stock" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
                  <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-lg">
                          {product.image}
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
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{product.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{product.sales}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[product.status].color}`}>
                        {statusConfig[product.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
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
                      <p className="font-medium">No products found</p>
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
      />
      <ProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
      />
      <DeleteModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        productName={deleteProduct?.name || ""}
      />
    </div>
  );
}
