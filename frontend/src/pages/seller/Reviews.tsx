import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: 1, buyer: "Kamal Perera", avatar: "KP", product: "Brake Pad Set - Toyota", rating: 5, comment: "Excellent quality brake pads! Perfect fit for my Toyota Corolla. Delivery was fast and packaging was secure. Highly recommend this seller.", date: "2026-02-26", helpful: 12 },
  { id: 2, buyer: "Nimal Silva", avatar: "NS", product: "Oil Filter - Honda", rating: 4, comment: "Good quality oil filter. Exactly as described. Took a day longer than expected for delivery but overall satisfied with the purchase.", date: "2026-02-24", helpful: 8 },
  { id: 3, buyer: "Ruwan Fernando", avatar: "RF", product: "Headlight Assembly", rating: 5, comment: "Amazing headlight assembly! Very bright and clear. Installation was straightforward. Great value for money.", date: "2026-02-22", helpful: 15 },
  { id: 4, buyer: "Saman Kumara", avatar: "SK", product: "Spark Plugs Set (4)", rating: 3, comment: "Spark plugs work fine but the packaging could be better. One plug was slightly loose in the box. Performance is good though.", date: "2026-02-20", helpful: 4 },
  { id: 5, buyer: "Ajith Bandara", avatar: "AB", product: "Air Filter - Suzuki", rating: 5, comment: "Perfect replacement air filter for my Suzuki Swift. Noticed improved engine performance after installation. Will buy again!", date: "2026-02-18", helpful: 10 },
  { id: 6, buyer: "Priya Mendis", avatar: "PM", product: "Radiator Hose Kit", rating: 4, comment: "Good quality hoses. Fit perfectly without any modifications needed. Seller was responsive to my questions before purchase.", date: "2026-02-15", helpful: 6 },
  { id: 7, buyer: "Dinesh Jayawardena", avatar: "DJ", product: "Timing Belt - Mitsubishi", rating: 2, comment: "The belt quality seems lower than expected for the price. It works but I'm not confident about long-term durability. Packaging was decent.", date: "2026-02-12", helpful: 3 },
  { id: 8, buyer: "Mahesh Wijesinghe", avatar: "MW", product: "Clutch Kit - Nissan", rating: 5, comment: "Outstanding clutch kit! Professional grade quality. My mechanic was impressed with the quality. Smooth installation and great performance.", date: "2026-02-10", helpful: 18 },
];

const ratingDistribution = [
  { stars: 5, count: 82, percentage: 52 },
  { stars: 4, count: 45, percentage: 29 },
  { stars: 3, count: 18, percentage: 11 },
  { stars: 2, count: 8, percentage: 5 },
  { stars: 1, count: 5, percentage: 3 },
];

const overallStats = {
  average: 4.6,
  total: 158,
  recommended: 92,
};

// ─── Star Rating Component ──────────────────────────────────────────────────
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

// ─── Reviews Page ───────────────────────────────────────────────────────────
export default function SellerReviews() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Ratings & Reviews</h1>
        <p className="text-sm text-muted-foreground">View customer feedback for your products</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Average Rating */}
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">{overallStats.average}</div>
            <StarRating rating={Math.round(overallStats.average)} size="lg" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on {overallStats.total} reviews
            </p>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="glass-card lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8 text-right">{item.stars}★</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{overallStats.average}/5.0</p>
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
              <p className="text-lg font-bold">{overallStats.total}</p>
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
              <p className="text-lg font-bold">{overallStats.recommended}%</p>
              <p className="text-xs text-muted-foreground">Would Recommend</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {MOCK_REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              className={cn(
                "px-6 py-5",
                idx < MOCK_REVIEWS.length - 1 && "border-b border-border/50"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">{review.avatar}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div>
                      <p className="font-semibold">{review.buyer}</p>
                      <p className="text-xs text-muted-foreground">
                        Purchased: <span className="text-foreground font-medium">{review.product}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
