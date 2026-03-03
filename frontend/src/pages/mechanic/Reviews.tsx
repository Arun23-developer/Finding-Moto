import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare, Wrench, TrendingUp, Award, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: 1, customer: "Ashan Perera", avatar: "AP", service: "Full Motorcycle Service", vehicle: "Honda CB150R", rating: 5, comment: "Excellent work on my CB150R! The engine runs so smoothly now. Ruwan really knows what he's doing. Fast service and fair pricing.", date: "2026-02-26", helpful: 14 },
  { id: 2, customer: "Nimal Fernando", avatar: "NF", service: "Brake Pad Replacement", vehicle: "Yamaha FZ-S", rating: 4, comment: "Good quality brake work. Brakes feel much better now. Took a bit longer than estimated but the result is great.", date: "2026-02-24", helpful: 9 },
  { id: 3, customer: "Kasun Silva", avatar: "KS", service: "Chain & Sprocket Change", vehicle: "Bajaj Pulsar NS200", rating: 5, comment: "Amazing job on the chain and sprocket replacement! Bike feels like brand new. Very professional workshop and reasonable prices.", date: "2026-02-22", helpful: 16 },
  { id: 4, customer: "Dilani Rathnayake", avatar: "DR", service: "Engine Overheating Fix", vehicle: "TVS Apache RTR", rating: 3, comment: "The overheating issue was fixed but it took two visits. First time they missed the thermostat issue. Resolved on second visit though.", date: "2026-02-20", helpful: 5 },
  { id: 5, customer: "Ruwan Jayasinghe", avatar: "RJ", service: "Clutch Cable Replacement", vehicle: "Honda Dio", rating: 5, comment: "Quick and efficient service. Fixed the clutch cable in under an hour. Very happy with the work quality!", date: "2026-02-18", helpful: 11 },
  { id: 6, customer: "Chamara Bandara", avatar: "CB", service: "Electrical Diagnostics", vehicle: "Suzuki Gixxer", rating: 4, comment: "Good diagnostic work. Found the electrical issue quickly. Parts were a bit pricey but labour charges were fair.", date: "2026-02-15", helpful: 7 },
  { id: 7, customer: "Tharindu Perera", avatar: "TP", service: "Tyre Replacement", vehicle: "Yamaha R15", rating: 2, comment: "Tyre replacement was okay but the wheel balancing wasn't done properly. Had to go back to get it fixed. Needs improvement.", date: "2026-02-12", helpful: 3 },
  { id: 8, customer: "Lahiru Mendis", avatar: "LM", service: "Full Engine Rebuild", vehicle: "Honda CBR250R", rating: 5, comment: "Incredible work on my engine rebuild! The bike runs perfectly. These guys really know their stuff. Worth every rupee spent.", date: "2026-02-10", helpful: 20 },
];

const ratingDistribution = [
  { stars: 5, count: 68, percentage: 55 },
  { stars: 4, count: 32, percentage: 26 },
  { stars: 3, count: 12, percentage: 10 },
  { stars: 2, count: 7, percentage: 6 },
  { stars: 1, count: 4, percentage: 3 },
];

const overallStats = {
  average: 4.7,
  total: 123,
  recommended: 94,
};

const ratingLabels: Record<number, { text: string; color: string }> = {
  5: { text: "Excellent", color: "text-emerald-500" },
  4: { text: "Great", color: "text-blue-500" },
  3: { text: "Average", color: "text-amber-500" },
  2: { text: "Poor", color: "text-orange-500" },
  1: { text: "Bad", color: "text-red-500" },
};

// ─── Star Rating Component ──────────────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-6 w-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            star <= rating
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]"
              : "fill-muted/40 text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

// ─── Reviews Page ───────────────────────────────────────────────────────────
export default function MechanicReviews() {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="overflow-hidden border-0 shadow-lg shadow-amber-600/5">
        <div className="relative p-8 bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-amber-200 text-sm font-medium">Workshop Reputation</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Ratings & Reviews</h1>
              <p className="text-amber-100/80 mt-1 text-sm">Customer feedback and satisfaction metrics for your workshop</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-extrabold tracking-tight">{overallStats.average}</div>
                <StarRating rating={Math.round(overallStats.average)} size="md" />
                <p className="text-amber-200/70 text-xs mt-1.5">{overallStats.total} reviews</p>
              </div>
              <div className="w-px h-16 bg-white/20 hidden md:block" />
              <div className="text-center hidden md:block">
                <div className="text-3xl font-extrabold">{overallStats.recommended}%</div>
                <p className="text-amber-200/70 text-xs mt-1">Recommend</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Average Rating", value: `${overallStats.average}`, sub: "out of 5.0", icon: Star, iconColor: "text-amber-500", iconBg: "bg-amber-500/10", border: "border-l-amber-500" },
          { label: "Total Reviews", value: `${overallStats.total}`, sub: "+12 this month", icon: MessageSquare, iconColor: "text-blue-500", iconBg: "bg-blue-500/10", border: "border-l-blue-500" },
          { label: "Would Recommend", value: `${overallStats.recommended}%`, sub: "satisfaction rate", icon: ThumbsUp, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10", border: "border-l-emerald-500" },
          { label: "Trending", value: "+0.3", sub: "vs last month", icon: TrendingUp, iconColor: "text-violet-500", iconBg: "bg-violet-500/10", border: "border-l-violet-500" },
        ].map((stat) => (
          <Card key={stat.label} className={cn("glass-card border-l-4 hover:shadow-md transition-shadow duration-300", stat.border)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.iconBg)}>
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                <p className={cn("text-[10px] font-medium mt-0.5", stat.iconColor)}>{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating Distribution */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-3">
            {ratingDistribution.map((item) => {
              const label = ratingLabels[item.stars];
              return (
                <div key={item.stars} className="flex items-center gap-3 group">
                  <div className="flex items-center gap-1.5 w-20">
                    <span className="text-sm font-semibold">{item.stars}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3.5 rounded-full bg-muted/50 overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        item.stars >= 4 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                        item.stars === 3 ? "bg-gradient-to-r from-amber-300 to-amber-400" :
                        "bg-gradient-to-r from-orange-300 to-orange-400"
                      )}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-28 justify-end">
                    <span className={cn("text-xs font-semibold", label.color)}>{label.text}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-semibold">Customer Reviews</CardTitle>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              {MOCK_REVIEWS.length} reviews
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {MOCK_REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              className={cn(
                "px-6 py-5 hover:bg-muted/20 transition-colors duration-200 group",
                idx < MOCK_REVIEWS.length - 1 && "border-b border-border/40"
              )}
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-offset-2 ring-offset-background",
                    review.rating >= 4
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white ring-amber-400/30"
                      : review.rating === 3
                      ? "bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800 ring-amber-300/30"
                      : "bg-gradient-to-br from-orange-200 to-red-200 text-red-700 ring-red-300/30"
                  )}>
                    {review.avatar}
                  </div>
                  {review.rating === 5 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] shadow-sm ring-2 ring-background">
                      ★
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{review.customer}</p>
                        {review.rating === 5 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Top Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Wrench className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground">{review.service}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{review.vehicle}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <StarRating rating={review.rating} />
                      <span className={cn("text-xs font-semibold", ratingLabels[review.rating]?.color)}>
                        {ratingLabels[review.rating]?.text}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-medium">{review.date}</span>
                    </div>
                  </div>

                  <div className="relative pl-4 mb-3">
                    <Quote className="absolute top-0 left-0 h-3 w-3 text-amber-400/40" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-600 transition-colors group/btn">
                      <ThumbsUp className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                      <span>Helpful</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-muted/60 text-[10px] font-semibold tabular-nums">
                        {review.helpful}
                      </span>
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
