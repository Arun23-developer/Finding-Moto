import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Eye, Loader2, Package, RefreshCw, Truck, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { createAuthedSocket, type ReturnWorkflowSocketEvent } from "@/lib/socket";
import { RETURN_STATUS_LABELS, RETURN_STATUS_STYLES, type ReturnRequest } from "@/lib/returns";
import { resolveMediaUrl } from "@/lib/imageUrl";

export function DeliveryAgentReturnPickups() {
  const { toast } = useToast();
  const [pickups, setPickups] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickup, setSelectedPickup] = useState<ReturnRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const fetchPickups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/returns/agent/pickups");
      setPickups(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      setPickups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  useEffect(() => {
    const socket = createAuthedSocket();
    if (!socket) return;

    socket.on("return:workflow", (event: ReturnWorkflowSocketEvent) => {
      if (event.audience !== "delivery_agent") return;
      fetchPickups();
      toast({
        title: event.title,
        description: event.message,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchPickups, toast]);

  const updateStatus = useCallback(
    async (returnRequestId: string, status: string) => {
      try {
        setUpdatingId(returnRequestId);
        await api.patch(`/returns/${returnRequestId}/agent-status`, { status, note });
        setNote("");
        await fetchPickups();
        setSelectedPickup((current) =>
          current && current._id === returnRequestId ? { ...current, status } : current
        );
        toast({
          title: "Status updated",
          description: `Return status updated to ${RETURN_STATUS_LABELS[status] || status}`,
        });
      } catch (error: any) {
        toast({
          title: "Update failed",
          description: error?.response?.data?.message || "Unable to update the return status.",
          variant: "destructive",
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchPickups, note, toast]
  );

  const completeDelivery = useCallback(async (returnRequestId: string) => {
    try {
      setUpdatingId(returnRequestId);
      await api.patch(`/returns/${returnRequestId}/complete-delivery`, {});
      setNote("");
      await fetchPickups();
      setSelectedPickup(null);
      toast({
        title: "Delivery completed",
        description: "Return package marked as delivered",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Unable to complete the delivery.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  }, [fetchPickups, toast]);

  const getBuyerName = (buyer?: ReturnRequest["buyer"]) => {
    if (!buyer) return "Buyer";
    return `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || buyer.email || "Buyer";
  };

  const activePickups = pickups.filter((p) => p.status !== "RETURN_DELIVERED");
  const completedPickups = pickups.filter((p) => p.status === "RETURN_DELIVERED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Return Pickups</h1>
          <p className="text-sm text-muted-foreground">Manage assigned return pickups and deliveries</p>
        </div>
        <Button variant="outline" onClick={fetchPickups} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Pickups</p>
            <p className="mt-2 text-3xl font-bold">{activePickups.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed Deliveries</p>
            <p className="mt-2 text-3xl font-bold">{completedPickups.length}</p>
          </CardContent>
        </Card>
      </div>

      {activePickups.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Active Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePickups.map((pickup) => (
                <div key={pickup._id} className="flex flex-col gap-3 rounded-lg border border-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{getBuyerName(pickup.buyer)}</h3>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${RETURN_STATUS_STYLES[pickup.status] || "border-border bg-muted text-foreground"}`}>
                        {RETURN_STATUS_LABELS[pickup.status] || pickup.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pickup.pickupAddress.fullAddress}, {pickup.pickupAddress.city}
                    </p>
                    <p className="text-xs text-muted-foreground">Reason: {pickup.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedPickup(pickup)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {completedPickups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedPickups.map((pickup) => (
                <div key={pickup._id} className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-muted-foreground">{getBuyerName(pickup.buyer)}</h3>
                      <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border-green-200">
                        Delivered
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pickup.pickupAddress.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && pickups.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No return pickups assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">Return pickups will appear here when assigned by sellers or mechanics</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(selectedPickup)} onOpenChange={(open) => !open && setSelectedPickup(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Pickup Details</DialogTitle>
            <DialogDescription>Review pickup information and update status</DialogDescription>
          </DialogHeader>

          {selectedPickup && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Return ID: {selectedPickup._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">From: {getBuyerName(selectedPickup.buyer)}</p>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${RETURN_STATUS_STYLES[selectedPickup.status] || "border-border bg-muted text-foreground"}`}>
                  {RETURN_STATUS_LABELS[selectedPickup.status] || selectedPickup.status}
                </span>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4 text-sm">
                  <div>
                    <p className="font-medium">Pickup Address</p>
                    <p className="mt-1 text-muted-foreground">
                      {selectedPickup.pickupAddress.fullAddress}, {selectedPickup.pickupAddress.city}, {selectedPickup.pickupAddress.district}{" "}
                      {selectedPickup.pickupAddress.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Return Reason</p>
                    <p className="mt-1 text-muted-foreground">{selectedPickup.reason}</p>
                  </div>
                  {selectedPickup.comments && (
                    <div>
                      <p className="font-medium">Buyer Notes</p>
                      <p className="mt-1 text-muted-foreground">{selectedPickup.comments}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Reference Photos</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedPickup.referencePhotos.map((photo) => (
                        <img key={photo} src={resolveMediaUrl(photo, "")} alt="Evidence" className="h-16 w-16 rounded-lg border border-border object-cover" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Update Note</label>
                <Textarea
                  rows={2}
                  placeholder="Add any notes about the pickup or delivery"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                {selectedPickup.status === "RETURN_PICKUP_ASSIGNED" && (
                  <Button onClick={() => updateStatus(selectedPickup._id, "RETURN_PICKED_UP")} disabled={updatingId !== null} className="w-full">
                    {updatingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                    Mark as Picked Up
                  </Button>
                )}
                {selectedPickup.status === "RETURN_PICKED_UP" && (
                  <Button onClick={() => updateStatus(selectedPickup._id, "RETURN_IN_TRANSIT")} disabled={updatingId !== null} className="w-full">
                    {updatingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                    Mark as In Transit
                  </Button>
                )}
                {selectedPickup.status === "RETURN_IN_TRANSIT" && (
                  <Button onClick={() => completeDelivery(selectedPickup._id)} disabled={updatingId !== null} className="w-full bg-green-600 hover:bg-green-700">
                    {updatingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Mark as Delivered
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPickup(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
