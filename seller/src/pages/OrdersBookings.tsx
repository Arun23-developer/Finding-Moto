import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Package, Wrench } from "lucide-react";

const orders = [
  { id: "#1042", customer: "Mike Johnson", type: "product", items: "Brake Pads x2", amount: "$89.90", date: "Feb 26, 2026", status: "Processing" },
  { id: "#1041", customer: "Sarah Williams", type: "service", items: "Engine Diagnostics", amount: "$75.00", date: "Feb 25, 2026", status: "Completed" },
  { id: "#1040", customer: "David Chen", type: "product", items: "Oil Filter + Transmission Fluid", amount: "$31.74", date: "Feb 25, 2026", status: "Shipped" },
  { id: "#1039", customer: "Lisa Anderson", type: "product", items: "Spark Plugs x4", amount: "$130.00", date: "Feb 24, 2026", status: "Completed" },
  { id: "#1038", customer: "Tom Baker", type: "service", items: "Full Service Package", amount: "$199.00", date: "Feb 24, 2026", status: "Pending" },
  { id: "#1037", customer: "Emma Wilson", type: "product", items: "Headlight Bulb H7 x2", amount: "$31.98", date: "Feb 23, 2026", status: "Completed" },
];

const statusColors: Record<string, string> = {
  Processing: "bg-warning/10 text-warning",
  Completed: "bg-success/10 text-success",
  Shipped: "bg-primary/10 text-primary",
  Pending: "bg-muted text-muted-foreground",
};

export default function OrdersBookings() {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? orders : orders.filter((o) => o.type === tab);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-display font-bold">Orders & Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage all your orders</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="product"><Package className="h-4 w-4 mr-1.5" />Products</TabsTrigger>
          <TabsTrigger value="service"><Wrench className="h-4 w-4 mr-1.5" />Services</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{o.id}</td>
                  <td className="py-3 px-4">{o.customer}</td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{o.items}</td>
                  <td className="py-3 px-4 font-medium">{o.amount}</td>
                  <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{o.date}</td>
                  <td className="py-3 px-4">
                    <Select defaultValue={o.status}>
                      <SelectTrigger className={`w-32 h-8 text-xs font-medium border-0 ${statusColors[o.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
