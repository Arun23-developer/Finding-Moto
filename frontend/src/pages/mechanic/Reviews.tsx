import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";

interface ReviewItem {
  _id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Distribution {
  stars: number;
  count: number;
  percentage: number;
}

interface ReviewStats {
  average: number;
  total: number;
  recommended: number;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5",
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export default function MechanicReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: 0, total: 0, recommended: 0 });
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setError("");
      const { data } = await api.get("/mechanic/reviews");
      if (data.success) {
        setStats(data.data.stats);
        setDistribution(data.data.distribution);
        setReviews(data.data.reviews);
      }
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const trendLabel = useMemo(() => {
    if (stats.average >= 4.5) return "Excellent performance";
    if (stats.average >= 4) return "Strong reputation";
    if (stats.average >= 3) return "Growing trust";
    return "Needs improvement";
  }, [stats.average]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-amber-600" />
        <p className="text-sm font-medium">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-3 text-red-500" />
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
        <h1 className="text-2xl font-bold">Ratings & Reviews</h1>
        <p className="text-sm text-muted-foreground">Real customer feedback for your services and parts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-amber-600 mb-2">{stats.average}</div>
            <StarRating rating={Math.round(stats.average)} size="lg" />
            <p className="text-sm text-muted-foreground mt-2">Based on {stats.total} reviews</p>
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8 text-right">{item.stars}★</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.average}/5.0</p>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.recommended}%</p>
              <p className="text-xs text-muted-foreground">Would Recommend</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Reviews</CardTitle>
          <p className="text-xs text-muted-foreground">{trendLabel}</p>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {reviews.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-xs mt-1">Reviews will appear here after completed customer orders.</p>
            </div>
          ) : (
            reviews.map((review, idx) => (
              <div key={review._id} className={cn("px-6 py-5", idx < reviews.length - 1 && "border-b border-border/50")}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <div>
                        <p className="text-sm text-foreground font-medium">{review.customerName || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">Item: <span className="text-foreground font-medium">{review.productName}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
