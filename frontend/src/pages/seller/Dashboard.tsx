import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerPlaceholderPage } from "./components/SellerPlaceholderPage";

const quickActions = [
  "Check new products awaiting updates",
  "Review pending orders",
  "Track low-stock priorities",
];

export default function SellerDashboard() {
  return (
    <SellerPlaceholderPage
      title="Dashboard"
      description="Monitor marketplace activity and jump into common seller tasks."
      summary={[
        { label: "Products", value: "24" },
        { label: "Orders", value: "12" },
        { label: "Revenue", value: "LKR 48,500" },
        { label: "Messages", value: "5" },
      ]}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Summary Cards Placeholder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Marketplace seller KPIs, delivery health, and finance highlights can appear here.
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <div key={action} className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
                {action}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SellerPlaceholderPage>
  );
}
