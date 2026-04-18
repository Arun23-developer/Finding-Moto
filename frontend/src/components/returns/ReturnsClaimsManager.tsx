import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, RefreshCw, RotateCcw, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { resolveMediaUrl } from "@/lib/imageUrl";
import { createAuthedSocket, type ReturnWorkflowSocketEvent } from "@/lib/socket";
import {
  NEXT_RETURN_STATUS,
  RETURN_STATUS_LABELS,
  RETURN_STATUS_STYLES,
  RETURN_TIMELINE,
  type ReturnRequest,
} from "@/lib/returns";

interface ReturnsClaimsManagerProps {
  role: "seller" | "mechanic";
  title: string;
  description: string;
}

interface DeliveryAgent {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
}

function getBuyerName(buyer?: ReturnRequest["buyer"]) {
  if (!buyer) return "Buyer";
  return `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || buyer.email || "Buyer";
}

export function ReturnsClaimsManager({ role, title, description }: ReturnsClaimsManagerProps) {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [note, setNote] = useState("");
  const [showAssignAgent, setShowAssignAgent] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<DeliveryAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/returns/manage");
      setReturns(Array.isArray(response.data.data) ? response.data.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const response = await api.get("/returns/agents/available");
      setAvailableAgents(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      toast({
        title: "Failed to load delivery agents",
        variant: "destructive",
      });
    } finally {
      setLoadingAgents(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    const socket = createAuthedSocket();
    if (!socket) return;

    socket.on("return:workflow", (event: ReturnWorkflowSocketEvent) => {
      if (event.audience !== role) return;
      fetchReturns();
      toast({
        title: event.title,
        description: event.message,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchReturns, role, toast]);

  const summary = useMemo(() => ({
    requested: returns.filter((item) => item.status === "RETURN_REQUESTED").length,
    active: returns.filter((item) => item.status !== "RETURN_REJECTED" && item.status !== "REFUND_COMPLETED").length,
    rejected: returns.filter((item) => item.status === "RETURN_REJECTED").length,
    refunded: returns.filter((item) => item.status === "REFUND_COMPLETED").length,
  }), [returns]);

  const updateStatus = useCallback(
    async (returnRequestId: string, status: string) => {
      try {
        setUpdatingId(returnRequestId);
        await api.patch(`/returns/${returnRequestId}/status`, { status, note });
        setNote("");
        await fetchReturns();
        setSelectedReturn((current) =>
          current && current._id === returnRequestId ? { ...current, status } : current
        );
        toast({
          title: "Status updated",
          description: `Return request updated to ${RETURN_STATUS_LABELS[status] || status}`,
        });
      } catch (error: any) {
        toast({
          title: "Update failed",
          description: error?.response?.data?.message || "Unable to update the return request.",
          variant: "destructive",
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchReturns, note, toast]
  );

  const handleAssignAgent = useCallback(
    async (returnRequestId: string, agentId: string) => {
      try {
        setUpdatingId(returnRequestId);
        await api.patch(`/returns/${returnRequestId}/assign-agent`, { agentId, note });
        setNote("");
        setShowAssignAgent(false);
        setSelectedAgent(null);
        await fetchReturns();
        toast({
          title: "Delivery agent assigned",
          description: "The delivery agent has been assigned for pickup",
        });
      } catch (error: any) {
        toast({
          title: "Assignment failed",
          description: error?.response?.data?.message || "Unable to assign delivery agent.",
          variant: "destructive",
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchReturns, note, toast]
  );

  const openAssignAgentDialog = useCallback(
    (returnRequest: ReturnRequest) => {
      setSelectedReturn(returnRequest);
      setShowAssignAgent(true);
      setSelectedAgent(null);
      setNote("");
      fetchAvailableAgents();
    },
    [fetchAvailableAgents]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" onClick={fetchReturns} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pending Review", value: summary.requested },
          { label: "Active Returns", value: summary.active },
          { label: "Rejected", value: summary.rejected },
          { label: "Refund Completed", value: summary.refunded },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Return Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && returns.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <RotateCcw className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No return requests yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Buyer return submissions will appear here.</p>
            </div>
          )}

          {!loading && returns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Return ID</th>
                    <th className="px-4 py-3 text-left font-medium">Buyer</th>
                    <th className="px-4 py-3 text-left font-medium">Reason</th>
                    <th className="px-4 py-3 text-left font-medium">Order</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((item) => {
                    const nextAction = NEXT_RETURN_STATUS[item.status];
                    return (
                      <tr key={item._id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 font-mono text-blue-600">#{item._id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3">{getBuyerName(item.buyer)}</td>
                        <td className="px-4 py-3">{item.reason}</td>
                        <td className="px-4 py-3">#{item.order?._id?.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${RETURN_STATUS_STYLES[item.status] || "border-border bg-muted text-foreground"}`}>
                            {RETURN_STATUS_LABELS[item.status] || item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "RETURN_REQUESTED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={updatingId === item._id}
                                  onClick={() => updateStatus(item._id, "RETURN_APPROVED")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {updatingId === item._id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={updatingId === item._id}
                                  onClick={() => updateStatus(item._id, "RETURN_REJECTED")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {item.status === "RETURN_APPROVED" && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={updatingId === item._id}
                                onClick={() => openAssignAgentDialog(item)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Truck className="mr-1 h-3 w-3" />
                                {updatingId === item._id ? "Assigning..." : "Assign Agent"}
                              </Button>
                            )}
                            {nextAction && item.status !== "RETURN_REQUESTED" && item.status !== "RETURN_APPROVED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === item._id}
                                onClick={() => updateStatus(item._id, nextAction.status)}
                              >
                                {updatingId === item._id ? <Loader2 className="h-3 w-3 animate-spin" /> : nextAction.label}
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => setSelectedReturn(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedReturn && !showAssignAgent)} onOpenChange={(open) => !open && setSelectedReturn(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
            <DialogDescription>Review the buyer details, evidence photos, and return timeline.</DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${RETURN_STATUS_STYLES[selectedReturn.status] || "border-border bg-muted text-foreground"}`}>
                  {RETURN_STATUS_LABELS[selectedReturn.status] || selectedReturn.status}
                </span>
                <p className="text-sm text-muted-foreground">
                  Order #{selectedReturn.order?._id?.slice(-8).toUpperCase()} · Buyer {getBuyerName(selectedReturn.buyer)}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4 text-sm">
                      <p className="font-medium">Reason</p>
                      <p className="mt-1 text-muted-foreground">{selectedReturn.reason}</p>
                      {selectedReturn.comments && (
                        <>
                          <p className="mt-4 font-medium">Buyer Comments</p>
                          <p className="mt-1 text-muted-foreground">{selectedReturn.comments}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {selectedReturn.status === "RETURN_PICKUP_ASSIGNED" && selectedReturn.assigned_agent && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4 text-sm">
                        <p className="font-medium text-blue-900">Assigned Delivery Agent</p>
                        <div className="mt-2 space-y-1 text-blue-800">
                          <p>{selectedReturn.assigned_agent.fullName}</p>
                          <p className="text-xs">{selectedReturn.assigned_agent.vehicleType} · {selectedReturn.assigned_agent.vehicleNumber}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-4 text-sm">
                      <p className="font-medium">Tracking Timeline</p>
                      <div className="mt-4 space-y-3">
                        {RETURN_TIMELINE.map((status, index) => {
                          const currentIndex = RETURN_TIMELINE.indexOf(selectedReturn.status as (typeof RETURN_TIMELINE)[number]);
                          const isComplete = currentIndex >= index;
                          return (
                            <div key={status} className="flex items-start gap-3">
                              <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${isComplete ? "border-green-600 bg-green-600 text-white" : "border-border bg-background text-muted-foreground"}`}>
                                {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px]">{index + 1}</span>}
                              </div>
                              <p className="text-sm">{RETURN_STATUS_LABELS[status]}</p>
                            </div>
                          );
                        })}
                        {selectedReturn.status === "RETURN_REJECTED" && (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <XCircle className="h-4 w-4" />
                            Request rejected
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4 text-sm">
                      <p className="font-medium">Pickup Address</p>
                      <p className="mt-1 text-muted-foreground">
                        {selectedReturn.pickupAddress.fullAddress}, {selectedReturn.pickupAddress.city}, {selectedReturn.pickupAddress.district} {selectedReturn.pickupAddress.postalCode}
                      </p>
                      <p className="mt-4 font-medium">Refund Account</p>
                      <p className="mt-1 text-muted-foreground">{selectedReturn.bankDetails.accountHolderName}</p>
                      <p className="text-muted-foreground">{selectedReturn.bankDetails.bankName}</p>
                      <p className="text-muted-foreground">{selectedReturn.bankDetails.accountNumber}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-sm">
                      <p className="font-medium">Reference Photos</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedReturn.referencePhotos.map((photo) => (
                          <img key={photo} src={resolveMediaUrl(photo, "")} alt="Return evidence" className="h-20 w-20 rounded-lg border border-border object-cover" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Note</label>
                <Textarea
                  rows={3}
                  placeholder="Optional note to record with the next status update"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReturn(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignAgent} onOpenChange={setShowAssignAgent}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Delivery Agent</DialogTitle>
            <DialogDescription>Select an available delivery agent for the return pickup</DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium">Return from {getBuyerName(selectedReturn.buyer)}</p>
                <p className="text-xs text-muted-foreground">Pickup: {selectedReturn.pickupAddress.city}</p>
              </div>

              {loadingAgents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : availableAgents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No available delivery agents</p>
                  <p className="text-xs text-muted-foreground">All delivery agents are currently busy or disabled.</p>
                </div>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {availableAgents.map((agent) => (
                    <label key={agent._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                      <input
                        type="radio"
                        name="agent"
                        value={agent._id}
                        checked={selectedAgent === agent._id}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{agent.fullName}</p>
                        <p className="text-xs text-muted-foreground">{agent.vehicleType} · {agent.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground">{agent.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Note (Optional)</label>
                <Textarea
                  rows={2}
                  placeholder="Add any special instructions or notes"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignAgent(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedAgent && selectedReturn && handleAssignAgent(selectedReturn._id, selectedAgent)}
              disabled={!selectedAgent || updatingId !== null}
            >
              {updatingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Assign Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
