import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerPlaceholderPage } from "./components/SellerPlaceholderPage";

export default function SellerReturnsClaims() {
  return (
    <SellerPlaceholderPage
      title="Returns & Claims"
      description="Review return requests, refund claims, and resolution statuses."
      summary={[
        { label: "Open Returns", value: "0" },
        { label: "Claims Pending", value: "0" },
        { label: "Resolved", value: "0" },
        { label: "Escalations", value: "0" },
      ]}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Returns & Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Return and claim records will appear here.
          </div>
        </CardContent>
      </Card>
    </SellerPlaceholderPage>
  );
}