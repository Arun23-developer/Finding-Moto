import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerPlaceholderPage } from "./components/SellerPlaceholderPage";

export default function SellerBuyerMessageCenter() {
  return (
    <SellerPlaceholderPage
      title="Buyer Message Center"
      description="Track conversations with customers and respond to order questions."
      summary={[
        { label: "Open Threads", value: "0" },
        { label: "Unread", value: "0" },
        { label: "Today", value: "0" },
        { label: "Resolved", value: "0" },
      ]}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Buyer Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Buyer conversations will appear here.
          </div>
        </CardContent>
      </Card>
    </SellerPlaceholderPage>
  );
}