import { Star } from "lucide-react";

const reviews = [
  { id: 1, customer: "Mike Johnson", rating: 5, text: "Excellent brake pads! Installed them myself and they work perfectly. Great price too.", date: "Feb 26, 2026", product: "Brake Pads - Premium" },
  { id: 2, customer: "Sarah Williams", rating: 5, text: "Very thorough diagnostic service. Found the issue quickly and explained everything clearly.", date: "Feb 25, 2026", product: "Engine Diagnostics" },
  { id: 3, customer: "David Chen", rating: 4, text: "Good quality oil filter. Shipping was a bit slow but product is great.", date: "Feb 24, 2026", product: "Oil Filter - Standard" },
  { id: 4, customer: "Lisa Anderson", rating: 5, text: "Best spark plugs I've used. Engine runs so smooth now!", date: "Feb 23, 2026", product: "Spark Plugs (Set of 4)" },
  { id: 5, customer: "Tom Baker", rating: 3, text: "Service was okay but had to wait longer than expected. The work itself was good quality.", date: "Feb 22, 2026", product: "Full Service Package" },
];

const ratingBreakdown = [
  { stars: 5, count: 842, pct: 66 },
  { stars: 4, count: 287, pct: 22 },
  { stars: 3, count: 98, pct: 8 },
  { stars: 2, count: 35, pct: 3 },
  { stars: 1, count: 12, pct: 1 },
];

export default function RatingsReviews() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-display font-bold">Ratings & Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">See what your customers are saying</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl card-shadow p-6 text-center">
          <p className="text-5xl font-display font-bold text-primary">4.8</p>
          <div className="flex justify-center gap-1 mt-2">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className={`h-5 w-5 ${i <= 4 ? 'fill-warning text-warning' : 'fill-warning/50 text-warning/50'}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">1,274 total reviews</p>
        </div>
        <div className="md:col-span-2 bg-card rounded-xl card-shadow p-6">
          <h3 className="font-display font-semibold mb-4">Rating Breakdown</h3>
          <div className="space-y-2.5">
            {ratingBreakdown.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="text-sm font-medium w-12">{r.stars} star</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-xl card-shadow p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {r.customer.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold">{r.customer}</p>
                  <p className="text-xs text-muted-foreground">{r.product} · {r.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
