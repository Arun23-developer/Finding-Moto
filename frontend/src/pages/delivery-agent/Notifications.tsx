import { Card, CardContent } from "@/components/ui/card";

export default function DeliveryNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Delivery alerts and updates will appear here.
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="font-medium">Notifications page is ready.</p>
          <p className="mt-1 text-xs">
            Delivery agent alerts can be surfaced here using the existing dashboard style.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
