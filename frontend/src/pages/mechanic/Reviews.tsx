import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, MessageSquare, RefreshCw, Star, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

interface MechanicReviewStats {
  average: number;
  total: number;
}

interface ProductRatingItem {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviewCount: number;
}

interface ServiceRatingItem {
  serviceId: string;
  serviceName: string;
  averageRating: number;
  totalReviewCount: number;
}

interface CustomerReviewItem {
  _id: string;
  itemType: "product" | "service";
  itemName: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

interface MechanicReviewsResponse {
  stats: MechanicReviewStats;
  productRatings: ProductRatingItem[];
  serviceRatings: ServiceRatingItem[];
  customerReviews: CustomerReviewItem[];
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starClass} ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`}
        />
      ))}
    </div>
  );
}

const formatReviewDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function RatingGridCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Array<{ id: string; name: string; averageRating: number; totalReviewCount: number }>;
  emptyLabel: string;
}) {
  return (
    <Card className="glass-card border border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 px-6 py-12 text-center text-muted-foreground">
            <Wrench className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium">{emptyLabel}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/40 bg-muted/30 p-5">
                <p className="line-clamp-2 min-h-[3rem] text-sm font-semibold text-foreground">{item.name}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-amber-500">{item.averageRating.toFixed(1)}</span>
                  <div>
                    <StarRating rating={item.averageRating} />
                    <p className="mt-1 text-xs text-muted-foreground">{item.totalReviewCount} review{item.totalReviewCount === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MechanicReviews() {
  const [data, setData] = useState<MechanicReviewsResponse>({
    stats: { average: 0, total: 0 },
    productRatings: [],
    serviceRatings: [],
    customerReviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const response = await api.get("/mechanic/reviews");
      if (response.data?.success) {
        setData(response.data.data);
      } else {
        setError("Failed to load reviews.");
      }
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const highlightedService = useMemo(
    () => data.serviceRatings.find((item) => item.totalReviewCount > 0),
    [data.serviceRatings]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-600" />
        <p className="text-sm font-medium">Loading ratings and reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="font-medium">{error}</p>
        <button onClick={fetchReviews} className="mt-3 inline-flex items-center gap-2 text-sm text-amber-600 hover:underline">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rating & Review</h1>
        <p className="text-sm text-muted-foreground">Monitor combined product and service feedback from your customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="glass-card border border-border/40">
          <CardContent className="flex h-full flex-col justify-center p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overall Average Rating</p>
            <div className="mt-4 flex items-end gap-4">
              <span className="text-5xl font-bold text-amber-500">{data.stats.average.toFixed(1)}</span>
              <div className="pb-1">
                <StarRating rating={data.stats.average} size="lg" />
                <p className="mt-2 text-sm text-muted-foreground">Based on {data.stats.total} product and service reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Rating Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/40 bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Products Rated</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.productRatings.filter((item) => item.totalReviewCount > 0).length}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Services Rated</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.serviceRatings.filter((item) => item.totalReviewCount > 0).length}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/40 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Service Highlight</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{highlightedService?.serviceName || "No service ratings yet"}</p>
              {highlightedService ? (
                <div className="mt-2 flex items-center gap-3">
                  <StarRating rating={highlightedService.averageRating} />
                  <span className="text-sm text-muted-foreground">
                    {highlightedService.averageRating.toFixed(1)} average from {highlightedService.totalReviewCount} reviews
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Customer service feedback will surface here once direct service ratings are received.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <RatingGridCard
        title="Individual Product Ratings"
        items={data.productRatings.map((item) => ({
          id: item.productId,
          name: item.productName,
          averageRating: item.averageRating,
          totalReviewCount: item.totalReviewCount,
        }))}
        emptyLabel="No rated products found"
      />

      <RatingGridCard
        title="Individual Service Ratings"
        items={data.serviceRatings.map((item) => ({
          id: item.serviceId,
          name: item.serviceName,
          averageRating: item.averageRating,
          totalReviewCount: item.totalReviewCount,
        }))}
        emptyLabel="No services found"
      />

      <Card className="glass-card border border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.customerReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 px-6 py-12 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="font-medium">No customer reviews yet</p>
              <p className="mt-1 text-xs">Reviews will appear here when buyers rate your products or service experience.</p>
            </div>
          ) : (
            data.customerReviews.map((review) => (
              <div key={review._id} className="rounded-2xl border border-border/40 bg-muted/25 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{review.customerName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.itemType === "product" ? "Product" : "Service"}: {review.itemName}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="flex items-center gap-2 sm:justify-end">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-medium text-amber-500">{review.rating.toFixed(1)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatReviewDate(review.reviewDate)}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.comment}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
