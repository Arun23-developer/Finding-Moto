import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerPlaceholderPage } from "./components/SellerPlaceholderPage";

export default function SellerNotificationCenter() {
  return (
    <SellerPlaceholderPage
      title="Notification Center"
      description="Review alerts about orders, inventory, and account activity."
      summary={[
        { label: "Unread", value: "0" },
        { label: "Today", value: "0" },
        { label: "Order Alerts", value: "0" },
        { label: "System Alerts", value: "0" },
      ]}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Notifications will appear here.
          </div>
        </CardContent>
      </Card>
    </SellerPlaceholderPage>
  );
}