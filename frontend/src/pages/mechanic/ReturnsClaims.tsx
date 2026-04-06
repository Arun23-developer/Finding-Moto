import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MechanicPlaceholderPage } from "./components/MechanicPlaceholderPage";

export default function MechanicReturnsClaims() {
  return (
    <MechanicPlaceholderPage
      title="Returns & Claims"
      description="Monitor return requests and claims from one place."
      summary={[
        { label: "Open Claims", value: "0" },
        { label: "Pending Review", value: "0" },
        { label: "Resolved", value: "0" },
        { label: "Refunded", value: "0" },
      ]}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Returns & Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Returns and claims activity will appear here.
          </div>
        </CardContent>
      </Card>
    </MechanicPlaceholderPage>
  );
}
