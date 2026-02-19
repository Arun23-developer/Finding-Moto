import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye } from "lucide-react";

const orders = [
  { id: "#FM-1024", customer: "Ahmed Garage", items: 3, total: "$342.00", status: "Delivered", payment: "Paid", date: "Feb 18, 2026" },
  { id: "#FM-1023", customer: "Quick Fix Motors", items: 1, total: "$128.50", status: "Shipped", payment: "Paid", date: "Feb 18, 2026" },
  { id: "#FM-1022", customer: "Ali Auto Parts", items: 5, total: "$567.00", status: "Processing", payment: "Paid", date: "Feb 17, 2026" },
  { id: "#FM-1021", customer: "Speed Mechanics", items: 2, total: "$89.99", status: "Pending", payment: "Unpaid", date: "Feb 17, 2026" },
  { id: "#FM-1020", customer: "Pro Garage", items: 4, total: "$445.00", status: "Delivered", payment: "Paid", date: "Feb 16, 2026" },
  { id: "#FM-1019", customer: "Sara Mechanic", items: 1, total: "$67.50", status: "Cancelled", payment: "Refunded", date: "Feb 16, 2026" },
  { id: "#FM-1018", customer: "John's Workshop", items: 7, total: "$892.00", status: "Delivered", payment: "Paid", date: "Feb 15, 2026" },
];

const statusStyles: Record<string, string> = {
  Delivered: "bg-success/15 text-success border-success/20",
  Shipped: "bg-info/15 text-info border-info/20",
  Processing: "bg-warning/15 text-warning border-warning/20",
  Pending: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/20",
};

const paymentStyles: Record<string, string> = {
  Paid: "text-success",
  Unpaid: "text-warning",
  Refunded: "text-muted-foreground",
};

export default function OrdersManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage all orders</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "1,315" },
          { label: "Pending", value: "42" },
          { label: "Processing", value: "28" },
          { label: "Delivered", value: "1,180" },
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
            <Input placeholder="Search orders..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">Order ID</th>
                  <th className="text-left py-3 font-medium">Shop</th>
                  <th className="text-left py-3 font-medium">Items</th>
                  <th className="text-left py-3 font-medium">Total</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Payment</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono font-medium text-primary">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3 text-muted-foreground">{order.items}</td>
                    <td className="py-3 font-semibold">{order.total}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={`py-3 text-xs font-medium ${paymentStyles[order.payment]}`}>{order.payment}</td>
                    <td className="py-3 text-muted-foreground">{order.date}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
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
