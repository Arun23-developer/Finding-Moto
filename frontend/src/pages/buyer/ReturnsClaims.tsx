import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, RotateCcw, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { resolveMediaUrl } from "@/lib/imageUrl";
import { createAuthedSocket, type ReturnWorkflowSocketEvent } from "@/lib/socket";
import {
  RETURN_REASONS,
  RETURN_STATUS_LABELS,
  RETURN_STATUS_STYLES,
  RETURN_TIMELINE,
  type ReturnRequest,
} from "@/lib/returns";

interface DeliveredOrder {
  _id: string;
  items: { product: string; name: string; price: number; qty: number; image?: string }[];
  totalAmount: number;
  createdAt: string;
}

const BuyerReturnsClaims = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [orders, setOrders] = useState<DeliveredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    reason: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    branchName: "",
    ifscOrSwiftCode: "",
    fullAddress: "",
    city: "",
    district: "",
    postalCode: "",
    comments: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requestedOrderId = searchParams.get("orderId") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [returnsRes, ordersRes] = await Promise.all([
        api.get("/returns/my"),
        api.get("/orders/my", { params: { status: "delivered" } }),
      ]);
      setReturns(Array.isArray(returnsRes.data.data) ? returnsRes.data.data : []);
      setOrders(Array.isArray(ordersRes.data.data) ? ordersRes.data.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!requestedOrderId) return;
    setForm((current) => ({ ...current, orderId: requestedOrderId }));
    setFormOpen(true);
  }, [requestedOrderId]);

  useEffect(() => {
    const socket = createAuthedSocket();
    if (!socket) return;

    socket.on("return:workflow", (event: ReturnWorkflowSocketEvent) => {
      if (event.audience !== "buyer") return;
      fetchData();
      toast({
        title: event.title,
        description: event.message,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchData, toast]);

  const returnedOrderIds = useMemo(() => new Set(returns.map((item) => item.order?._id)), [returns]);

  const eligibleOrders = useMemo(
    () => orders.filter((order) => !returnedOrderIds.has(order._id)),
    [orders, returnedOrderIds]
  );

  const openFormForOrder = (orderId?: string) => {
    setErrors({});
    setPhotos([]);
    setForm((current) => ({ ...current, orderId: orderId || eligibleOrders[0]?._id || current.orderId }));
    setFormOpen(true);
  };

  const closeForm = (nextOpen: boolean) => {
    setFormOpen(nextOpen);
    if (!nextOpen) {
      setSearchParams({});
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.orderId) nextErrors.orderId = "Select an order";
    if (!form.reason) nextErrors.reason = "Select a reason";
    if (photos.length < 1) nextErrors.referencePhotos = "Upload at least one image";
    if (!form.accountHolderName.trim()) nextErrors.accountHolderName = "Required";
    if (!form.bankName.trim()) nextErrors.bankName = "Required";
    if (!form.accountNumber.trim()) nextErrors.accountNumber = "Required";
    if (!form.fullAddress.trim()) nextErrors.fullAddress = "Required";
    if (!form.city.trim()) nextErrors.city = "Required";
    if (!form.district.trim()) nextErrors.district = "Required";
    if (!form.postalCode.trim()) nextErrors.postalCode = "Required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    payload.append("orderId", form.orderId);
    payload.append("reason", form.reason);
    payload.append("accountHolderName", form.accountHolderName);
    payload.append("bankName", form.bankName);
    payload.append("accountNumber", form.accountNumber);
    payload.append("branchName", form.branchName);
    payload.append("ifscOrSwiftCode", form.ifscOrSwiftCode);
    payload.append("fullAddress", form.fullAddress);
    payload.append("city", form.city);
    payload.append("district", form.district);
    payload.append("postalCode", form.postalCode);
    payload.append("comments", form.comments);
    photos.forEach((photo) => payload.append("referencePhotos", photo));

    try {
      setSubmitting(true);
      await api.post("/returns", payload);
      toast({
        title: "Return request submitted",
        description: "Your request is now waiting for seller or mechanic review.",
      });
      setForm({
        orderId: "",
        reason: "",
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        branchName: "",
        ifscOrSwiftCode: "",
        fullAddress: "",
        city: "",
        district: "",
        postalCode: "",
        comments: "",
      });
      setPhotos([]);
      closeForm(false);
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error?.response?.data?.message || "Unable to submit the return request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" className="mb-3 px-0" onClick={() => navigate("/my-orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Orders
          </Button>
          <h1 className="text-2xl font-bold">Return & Claims</h1>
          <p className="text-sm text-muted-foreground">Track pickup, return delivery, and refund progress from one place.</p>
        </div>
        <Button onClick={() => openFormForOrder()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          New Return Request
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Your Return Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && returns.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <RotateCcw className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No returns or claims yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Delivered orders will let you start a return request here.</p>
            </div>
          )}

          {!loading &&
            returns.map((item) => {
              const timelineIndex = RETURN_TIMELINE.indexOf(item.status as (typeof RETURN_TIMELINE)[number]);
              return (
                <div key={item._id} className="rounded-2xl border border-border bg-background/80 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Return #{item._id.slice(-8).toUpperCase()} for Order #{item.order?._id?.slice(-8).toUpperCase()}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{item.reason}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Requested on {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${RETURN_STATUS_STYLES[item.status] || "bg-muted text-foreground border-border"}`}>
                      {RETURN_STATUS_LABELS[item.status] || item.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <p className="text-sm font-medium">Tracking Flow</p>
                      <div className="mt-4 space-y-3">
                        {RETURN_TIMELINE.map((status, index) => {
                          const isComplete = timelineIndex >= index;
                          const isCurrent = item.status === status;
                          return (
                            <div key={status} className="flex items-start gap-3">
                              <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${isComplete ? "border-green-600 bg-green-600 text-white" : "border-border bg-background text-muted-foreground"}`}>
                                {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px]">{index + 1}</span>}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                                  {RETURN_STATUS_LABELS[status]}
                                </p>
                                {isCurrent && <p className="text-xs text-muted-foreground">Current stage</p>}
                              </div>
                            </div>
                          );
                        })}
                        {item.status === "RETURN_REJECTED" && (
                          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                            <XCircle className="mt-0.5 h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">Return request rejected</p>
                              <p className="text-xs">This request was not approved for return processing.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-muted/30 p-4 text-sm">
                      <div>
                        <p className="font-medium">Pickup Address</p>
                        <p className="mt-1 text-muted-foreground">
                          {item.pickupAddress.fullAddress}, {item.pickupAddress.city}, {item.pickupAddress.district} {item.pickupAddress.postalCode}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Refund Account</p>
                        <p className="mt-1 text-muted-foreground">
                          {item.bankDetails.accountHolderName} · {item.bankDetails.bankName}
                        </p>
                        <p className="text-muted-foreground">{item.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="font-medium">Reference Photos</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.referencePhotos.map((photo) => (
                            <img
                              key={photo}
                              src={resolveMediaUrl(photo, "")}
                              alt="Return evidence"
                              className="h-16 w-16 rounded-lg border border-border object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={closeForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Return Request Form</DialogTitle>
            <DialogDescription>Fill in the required details to submit a return or claim.</DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <select
                  value={form.orderId}
                  onChange={(event) => setForm((current) => ({ ...current, orderId: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select delivered order</option>
                  {eligibleOrders.map((order) => (
                    <option key={order._id} value={order._id}>
                      Order #{order._id.slice(-8).toUpperCase()} · LKR {order.totalAmount.toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.orderId && <p className="text-xs text-destructive">{errors.orderId}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Return Reason</label>
                <select
                  value={form.reason}
                  onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select reason</option>
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Photos</label>
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border p-5 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => setPhotos(Array.from(event.target.files || []))}
                />
                <div>
                  <Upload className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload at least 1 image</p>
                  <p className="text-xs text-muted-foreground">{photos.length} file(s) selected</p>
                </div>
              </label>
              {errors.referencePhotos && <p className="text-xs text-destructive">{errors.referencePhotos}</p>}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Bank Account Details for Refund</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Input placeholder="Account Holder Name" value={form.accountHolderName} onChange={(event) => setForm((current) => ({ ...current, accountHolderName: event.target.value }))} />{errors.accountHolderName && <p className="mt-1 text-xs text-destructive">{errors.accountHolderName}</p>}</div>
                <div><Input placeholder="Bank Name" value={form.bankName} onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))} />{errors.bankName && <p className="mt-1 text-xs text-destructive">{errors.bankName}</p>}</div>
                <div><Input placeholder="Account Number" value={form.accountNumber} onChange={(event) => setForm((current) => ({ ...current, accountNumber: event.target.value }))} />{errors.accountNumber && <p className="mt-1 text-xs text-destructive">{errors.accountNumber}</p>}</div>
                <div><Input placeholder="Branch Name" value={form.branchName} onChange={(event) => setForm((current) => ({ ...current, branchName: event.target.value }))} /></div>
                <div className="md:col-span-2"><Input placeholder="IFSC / SWIFT Code" value={form.ifscOrSwiftCode} onChange={(event) => setForm((current) => ({ ...current, ifscOrSwiftCode: event.target.value }))} /></div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Pickup Address</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><Input placeholder="Full Address" value={form.fullAddress} onChange={(event) => setForm((current) => ({ ...current, fullAddress: event.target.value }))} />{errors.fullAddress && <p className="mt-1 text-xs text-destructive">{errors.fullAddress}</p>}</div>
                <div><Input placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />{errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}</div>
                <div><Input placeholder="District" value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} />{errors.district && <p className="mt-1 text-xs text-destructive">{errors.district}</p>}</div>
                <div className="md:col-span-2"><Input placeholder="PIN Code / Postal Code" value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} />{errors.postalCode && <p className="mt-1 text-xs text-destructive">{errors.postalCode}</p>}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <Textarea
                rows={4}
                placeholder="Add any extra details if needed"
                value={form.comments}
                onChange={(event) => setForm((current) => ({ ...current, comments: event.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => closeForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Return Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyerReturnsClaims;
