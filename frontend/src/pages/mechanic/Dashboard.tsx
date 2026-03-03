import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  DollarSign,
  Star,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import api from "@/services/api";

// ─── Mock Data ──────────────────────────────────────────────────────────────
interface ServiceRequest {
  id: string;
  customer: string;
  vehicle: string;
  issue: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  amount: number;
}

const MOCK_REQUESTS: ServiceRequest[] = [
  { id: 'SR-1001', customer: 'Ashan Perera', vehicle: 'Honda CB150R', issue: 'Engine overheating', status: 'pending', date: '2026-02-25', amount: 5500 },
  { id: 'SR-1002', customer: 'Nimal Fernando', vehicle: 'Yamaha FZ-S', issue: 'Brake pad replacement', status: 'accepted', date: '2026-02-24', amount: 3200 },
  { id: 'SR-1003', customer: 'Kasun Silva', vehicle: 'Bajaj Pulsar NS200', issue: 'Chain and sprocket change', status: 'in_progress', date: '2026-02-23', amount: 7800 },
  { id: 'SR-1004', customer: 'Dilani Rathnayake', vehicle: 'TVS Apache RTR', issue: 'Full service', status: 'completed', date: '2026-02-22', amount: 12000 },
  { id: 'SR-1005', customer: 'Ruwan Jayasinghe', vehicle: 'Honda Dio', issue: 'Clutch cable replacement', status: 'completed', date: '2026-02-21', amount: 2500 },
  { id: 'SR-1006', customer: 'Chamara Bandara', vehicle: 'Suzuki Gixxer', issue: 'Electrical diagnostics', status: 'cancelled', date: '2026-02-20', amount: 4000 },
];

const WEEKLY_JOBS = [3, 5, 4, 7, 6, 8, 10];
const WEEKLY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fmt = (n: number) => `LKR ${n.toLocaleString()}`;

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  accepted: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  in_progress: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
};

const statusLabels: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  accepted: <CheckCircle className="h-3 w-3" />,
  in_progress: <Activity className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <span className="h-3 w-3">✕</span>,
};

interface DashboardService {
  _id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

const categoryIcons: Record<string, string> = {
  General: '🔧',
  Engine: '⚙️',
  Brakes: '🛑',
  Electrical: '⚡',
  Tyres: '🛞',
  Transmission: '🔗',
  Suspension: '🏍️',
};

// ─── Dashboard Overview ─────────────────────────────────────────────────────
export default function MechanicDashboard() {
  const { user } = useAuth();
  const [dashServices, setDashServices] = useState<DashboardService[]>([]);

  useEffect(() => {
    api.get('/mechanic/services')
      .then((res) => {
        if (res.data.success) {
          setDashServices(res.data.data.filter((s: DashboardService) => s.active).slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  const totalEarnings = MOCK_REQUESTS.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0);
  const pendingRequests = MOCK_REQUESTS.filter(r => r.status === 'pending' || r.status === 'accepted').length;
  const completedJobs = MOCK_REQUESTS.filter(r => r.status === 'completed').length;
  const maxJobs = Math.max(...WEEKLY_JOBS);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="glass-card overflow-hidden">
        <div className="relative p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}! 🔧</h1>
              <p className="text-amber-100 mt-1">Here's what's happening with your services today.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm">
              <Wrench className="h-4 w-4" />
              <span className="text-sm font-medium">
                {(user as any)?.workshopName || (user as any)?.specialization || 'My Workshop'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: fmt(totalEarnings), change: '+15.2%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-t-emerald-500' },
          { label: 'Pending Requests', value: `${pendingRequests}`, change: 'Need action', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-t-amber-500' },
          { label: 'Completed Jobs', value: `${completedJobs}`, change: 'This month', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-t-blue-500' },
          { label: 'Rating', value: '4.8', change: 'Based on 45 reviews', icon: Star, color: 'text-purple-600', bg: 'bg-purple-600/10', border: 'border-t-purple-500' },
        ].map(kpi => (
          <Card key={kpi.label} className={cn("glass-card border-t-4", kpi.border)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className={cn("text-xs mt-1 font-medium", kpi.color)}>{kpi.change}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Jobs Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Weekly Jobs</CardTitle>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-medium">
                This Week
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48 pt-4">
              {WEEKLY_JOBS.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">{val}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${(val / maxJobs) * 100}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg" />
                  </div>
                  <span className="text-xs text-muted-foreground">{WEEKLY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Requests</CardTitle>
              <Link to="/mechanic/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 p-0 px-6 pb-6">
            {MOCK_REQUESTS.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-amber-600/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-600">{req.customer.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{req.customer}</p>
                  <p className="text-xs text-muted-foreground truncate">{req.vehicle} · {req.issue}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">{fmt(req.amount)}</p>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", statusColors[req.status])}>
                    {statusIcons[req.status]} {statusLabels[req.status]}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Services Offered */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Services Offered</CardTitle>
            <Link to="/mechanic/services" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {dashServices.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {dashServices.map(svc => (
              <div key={svc._id} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-xl">
                  {categoryIcons[svc.category] || '🔧'}
                </div>
                <div>
                  <p className="text-xs font-semibold">{svc.name}</p>
                  <p className="text-[10px] text-amber-600 font-medium">LKR {svc.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Wrench className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No services added yet</p>
              <Link to="/mechanic/services" className="text-xs text-amber-600 mt-1 hover:underline">Add your first service</Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Jobs */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Upcoming Jobs</CardTitle>
            <Link to="/mechanic/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_REQUESTS.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map((job) => (
            <div key={job.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-amber-600">{job.customer.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{job.customer}</p>
                <p className="text-xs text-muted-foreground">{job.vehicle} — {job.issue}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{job.date}</p>
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border mt-1", statusColors[job.status])}>
                  {statusLabels[job.status]}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
