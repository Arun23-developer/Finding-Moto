import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreVertical, Package } from "lucide-react";

const products = [
  { id: 1, name: "Brake Pad Set - Toyota", sku: "BP-TOY-001", price: "$45.99", stock: 142, category: "Brakes", shop: "Ahmed's Auto Parts", image: "🔧" },
  { id: 2, name: "Oil Filter - Honda", sku: "OF-HON-002", price: "$12.99", stock: 350, category: "Engine", shop: "Quick Fix Motors", image: "⚙️" },
  { id: 3, name: "Spark Plug Set - Universal", sku: "SP-UNI-003", price: "$24.99", stock: 0, category: "Electrical", shop: "Pro Auto Center", image: "⚡" },
  { id: 4, name: "Headlight Assembly - BMW", sku: "HL-BMW-004", price: "$189.99", stock: 23, category: "Body Parts", shop: "Ali Garage", image: "💡" },
  { id: 5, name: "Timing Belt - Nissan", sku: "TB-NIS-005", price: "$67.50", stock: 78, category: "Engine", shop: "Ahmed's Auto Parts", image: "🔗" },
  { id: 6, name: "Alternator - Ford", sku: "AL-FRD-006", price: "$145.00", stock: 15, category: "Electrical", shop: "John's Workshop", image: "🔌" },
];

export default function ProductsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Product Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage auto parts and services listings</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: "3,847" },
          { label: "In Stock", value: "3,412" },
          { label: "Out of Stock", value: "135" },
          { label: "Categories", value: "24" },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-display font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">Product</th>
                  <th className="text-left py-3 font-medium">SKU</th>
                  <th className="text-left py-3 font-medium">Price</th>
                  <th className="text-left py-3 font-medium">Stock</th>
                  <th className="text-left py-3 font-medium">Shop</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-lg">
                          {product.image}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                    <td className="py-3 font-semibold">{product.price}</td>
                    <td className="py-3">
                      <span className={product.stock === 0 ? "text-destructive font-medium" : "text-foreground"}>
                        {product.stock === 0 ? "Out of stock" : product.stock}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{product.shop}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
