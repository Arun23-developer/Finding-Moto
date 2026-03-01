import { X, Clock } from "lucide-react";

const notifications = [
  { id: 1, title: "New order received", desc: "Order #1042 - Brake Pads x2", time: "5 min ago", unread: true },
  { id: 2, title: "Review posted", desc: "⭐⭐⭐⭐⭐ Great service!", time: "1 hour ago", unread: true },
  { id: 3, title: "Low stock alert", desc: "Oil Filter - Only 3 remaining", time: "3 hours ago", unread: false },
  { id: 4, title: "Booking confirmed", desc: "Engine Diagnostics - Tomorrow 2PM", time: "5 hours ago", unread: false },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-12 w-80 bg-card rounded-xl border border-border card-shadow animate-fade-up z-50">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display font-semibold text-sm">Notifications</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${n.unread ? 'bg-accent/30' : ''}`}>
            <div className="flex items-start gap-3">
              {n.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
              <div className={!n.unread ? 'ml-5' : ''}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {n.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
