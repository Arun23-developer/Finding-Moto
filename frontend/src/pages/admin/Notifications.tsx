import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, ShoppingCart, UserPlus, AlertTriangle, Package } from "lucide-react";

const notifications = [
  { id: 1, type: "order", title: "New order received", message: "Ahmed Garage placed order #FM-1024 for $342.00", time: "2 min ago", read: false, icon: ShoppingCart },
  { id: 2, type: "user", title: "New shop registration", message: "Pro Auto Center has registered and is pending approval", time: "15 min ago", read: false, icon: UserPlus },
  { id: 3, type: "alert", title: "Low stock alert", message: "Spark Plug Set - Universal is out of stock (SKU: SP-UNI-003)", time: "1 hour ago", read: false, icon: AlertTriangle },
  { id: 4, type: "order", title: "Order delivered", message: "Order #FM-1020 has been successfully delivered to Pro Garage", time: "3 hours ago", read: true, icon: Package },
  { id: 5, type: "user", title: "Shop suspended", message: "Ali Garage has been suspended due to policy violation", time: "5 hours ago", read: true, icon: AlertTriangle },
  { id: 6, type: "order", title: "Payment received", message: "Payment of $567.00 received for order #FM-1022", time: "6 hours ago", read: true, icon: ShoppingCart },
  { id: 7, type: "user", title: "New mechanic registered", message: "Sara Mechanic joined the platform", time: "8 hours ago", read: true, icon: UserPlus },
];

const typeColors: Record<string, string> = {
  order: "bg-info/15 text-info",
  user: "bg-primary/15 text-primary",
  alert: "bg-warning/15 text-warning",
};

export default function Notifications() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unread} unread notifications</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Check className="h-4 w-4" />
          Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`glass-card transition-all duration-200 hover:shadow-md cursor-pointer ${
              !notif.read ? "border-l-2 border-l-primary" : ""
            }`}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[notif.type]}`}>
                <notif.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{notif.time}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
