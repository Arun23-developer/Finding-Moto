import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'services' | 'requests' | 'schedule' | 'profile';

interface ServiceRequest {
  id: string;
  customer: string;
  vehicle: string;
  issue: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  amount: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => `LKR ${n.toLocaleString()}`;

const statusColor: Record<string, string> = {
  pending: '#D97706', accepted: '#2563EB', in_progress: '#7C3AED',
  completed: '#059669', cancelled: '#DC2626',
};

const statusBg: Record<string, string> = {
  pending: '#FFFBEB', accepted: '#EFF6FF', in_progress: '#F5F3FF',
  completed: '#ECFDF5', cancelled: '#FEF2F2',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled',
};

// ─── Sub-page components ──────────────────────────────────────────────────────
function OverviewTab({ user }: { user: any }) {
  const maxJobs = Math.max(...WEEKLY_JOBS);
  const totalEarnings = MOCK_REQUESTS.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0);
  const pendingRequests = MOCK_REQUESTS.filter(r => r.status === 'pending' || r.status === 'accepted').length;

  return (
    <div className="sd-content">
      {/* Welcome banner */}
      <div className="sd-welcome-banner" style={{ background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}>
        <div>
          <h1 className="sd-welcome-title">Welcome back, {user?.firstName}! 🔧</h1>
          <p className="sd-welcome-sub">Here's what's happening with your services today.</p>
        </div>
        <div className="sd-shop-chip" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
          <span>🔧</span>
          <span>{user?.workshopName || user?.specialization || 'My Workshop'}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="sd-kpi-grid">
        {[
          { label: 'Total Earnings', value: fmt(totalEarnings), change: '+15.2%', icon: '💰', color: '#059669', bg: '#ECFDF5' },
          { label: 'Pending Requests', value: `${pendingRequests}`, change: 'Need action', icon: '📋', color: '#D97706', bg: '#FFFBEB' },
          { label: 'Completed Jobs', value: `${MOCK_REQUESTS.filter(r => r.status === 'completed').length}`, change: 'This month', icon: '✅', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Rating', value: '4.8 ⭐', change: 'Based on 45 reviews', icon: '🏆', color: '#7C3AED', bg: '#F5F3FF' },
        ].map(kpi => (
          <div key={kpi.label} className="sd-kpi-card" style={{ borderTop: `4px solid ${kpi.color}` }}>
            <div className="sd-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div>
              <div className="sd-kpi-value">{kpi.value}</div>
              <div className="sd-kpi-label">{kpi.label}</div>
              <div className="sd-kpi-change" style={{ color: kpi.color }}>{kpi.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly jobs chart + recent requests */}
      <div className="sd-row-2">
        <div className="sd-card sd-chart-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Weekly Jobs</h3>
            <span className="sd-card-badge">This Week</span>
          </div>
          <div className="sd-bar-chart">
            {WEEKLY_JOBS.map((val, i) => (
              <div key={i} className="sd-bar-col">
                <div
                  className="sd-bar"
                  style={{ height: `${(val / maxJobs) * 100}%`, background: 'linear-gradient(180deg, #D97706, #F59E0B)' }}
                  title={`${val} jobs`}
                >
                  <span className="sd-bar-tip">{val}</span>
                </div>
                <span className="sd-bar-label">{WEEKLY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sd-card sd-recent-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Recent Requests</h3>
            <span className="sd-card-badge sd-card-badge-green">{MOCK_REQUESTS.filter(r => r.status === 'pending').length} Pending</span>
          </div>
          <div className="sd-order-list">
            {MOCK_REQUESTS.slice(0, 5).map(req => (
              <div key={req.id} className="sd-order-row">
                <div className="sd-order-avatar">{req.customer.charAt(0)}</div>
                <div className="sd-order-info">
                  <span className="sd-order-id">{req.id}</span>
                  <span className="sd-order-buyer">{req.customer} · {req.vehicle}</span>
                </div>
                <div className="sd-order-right">
                  <span className="sd-order-amount">{fmt(req.amount)}</span>
                  <span className="sd-badge" style={{ background: statusBg[req.status], color: statusColor[req.status] }}>
                    {statusLabel[req.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceRequestsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = MOCK_REQUESTS.filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Service Requests</h2>
          <p className="sd-page-sub">{MOCK_REQUESTS.length} total requests</p>
        </div>
      </div>

      <div className="sd-order-strips">
        {(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] as const).map(s => {
          const count = MOCK_REQUESTS.filter(r => r.status === s).length;
          return (
            <div key={s} className="sd-order-strip" style={{ borderLeft: `4px solid ${statusColor[s]}` }}>
              <span className="sd-strip-num" style={{ color: statusColor[s] }}>{count}</span>
              <span className="sd-strip-label">{statusLabel[s]}</span>
            </div>
          );
        })}
      </div>

      <div className="sd-filter-tabs" style={{ marginBottom: 16 }}>
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`sd-filter-tab ${statusFilter === f ? 'sd-filter-tab-active' : ''}`}
            onClick={() => setStatusFilter(f)}
          >
            {f === 'all' ? 'All' : statusLabel[f]}
          </button>
        ))}
      </div>

      <div className="sd-card sd-table-card">
        <table className="sd-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Issue</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(req => (
              <tr key={req.id}>
                <td className="sd-order-id-cell">{req.id}</td>
                <td>
                  <div className="sd-table-buyer">
                    <div className="sd-buyer-avatar">{req.customer.charAt(0)}</div>
                    {req.customer}
                  </div>
                </td>
                <td className="sd-table-name">{req.vehicle}</td>
                <td className="sd-table-muted">{req.issue}</td>
                <td className="sd-table-price">{fmt(req.amount)}</td>
                <td className="sd-table-muted">{req.date}</td>
                <td>
                  <span className="sd-badge" style={{ background: statusBg[req.status], color: statusColor[req.status] }}>
                    {statusLabel[req.status]}
                  </span>
                </td>
                <td>
                  {req.status === 'pending' && (
                    <button className="sd-btn-xs sd-btn-confirm">Accept</button>
                  )}
                  {req.status === 'accepted' && (
                    <button className="sd-btn-xs sd-btn-ship">Start Work</button>
                  )}
                  {req.status === 'in_progress' && (
                    <button className="sd-btn-xs sd-btn-confirm">Complete</button>
                  )}
                  {(req.status === 'completed' || req.status === 'cancelled') && (
                    <button className="sd-btn-xs sd-btn-view">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MyServicesTab() {
  const services = [
    { name: 'Full Service', price: 'LKR 12,000', icon: '🔧', description: 'Complete motorcycle service including oil change, filter, chain adjustment' },
    { name: 'Engine Repair', price: 'LKR 8,000+', icon: '⚙️', description: 'Engine diagnostics and repair for all motorcycle brands' },
    { name: 'Brake Service', price: 'LKR 3,500', icon: '🛑', description: 'Brake pad replacement, disc inspection and adjustment' },
    { name: 'Electrical Diagnostics', price: 'LKR 4,000', icon: '⚡', description: 'Complete electrical system check and repair' },
    { name: 'Tyre Change', price: 'LKR 2,500', icon: '🛞', description: 'Tyre replacement and wheel balancing' },
    { name: 'Chain & Sprocket', price: 'LKR 7,500', icon: '🔗', description: 'Chain and sprocket set replacement with alignment' },
  ];

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">My Services</h2>
          <p className="sd-page-sub">Services you offer to customers</p>
        </div>
        <button className="sd-btn-primary">
          <span>+</span> Add Service
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {services.map(svc => (
          <div key={svc.name} className="sd-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#FFFBEB', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px'
              }}>{svc.icon}</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>{svc.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#D97706' }}>{svc.price}</p>
              </div>
            </div>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>{svc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleTab() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const todayJobs = MOCK_REQUESTS.filter(r =>
    (r.status === 'accepted' || r.status === 'in_progress') && r.date >= todayStr
  );

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Schedule</h2>
          <p className="sd-page-sub">Your upcoming appointments</p>
        </div>
      </div>

      <div className="sd-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' }}>
          📅 Today — {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        {todayJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>📅</p>
            <p>No scheduled services for today</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayJobs.map(job => (
              <div key={job.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', borderRadius: '12px',
                border: '1px solid #E5E7EB', background: '#FAFAFA'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: '#FFFBEB', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, color: '#D97706', fontSize: '14px'
                }}>{job.customer.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{job.customer}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6B7280' }}>
                    {job.vehicle} — {job.issue}
                  </p>
                </div>
                <span className="sd-badge" style={{ background: statusBg[job.status], color: statusColor[job.status] }}>
                  {statusLabel[job.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming this week */}
      <div className="sd-card" style={{ padding: '24px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' }}>
          🗓️ Upcoming Jobs
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MOCK_REQUESTS.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map(job => (
            <div key={job.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderRadius: '10px',
              border: '1px solid #F3F4F6'
            }}>
              <div style={{ fontSize: '12px', color: '#9CA3AF', minWidth: '80px' }}>{job.date}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{job.customer}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{job.issue}</p>
              </div>
              <span className="sd-badge" style={{ background: statusBg[job.status], color: statusColor[job.status], fontSize: '11px' }}>
                {statusLabel[job.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkshopProfileTab({ user }: { user: any }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Workshop Profile</h2>
          <p className="sd-page-sub">Manage your workshop details</p>
        </div>
        <button className="sd-btn-primary" onClick={() => setEditing(!editing)}>
          {editing ? '💾 Save Changes' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="sd-profile-layout">
        <div className="sd-card sd-shop-card">
          <div className="sd-shop-banner" style={{ background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}>
            <div className="sd-shop-logo">🔧</div>
          </div>
          <div className="sd-shop-info">
            {editing ? (
              <div className="sd-form-grid">
                {[
                  { label: 'First Name', value: user?.firstName || '', placeholder: 'First name' },
                  { label: 'Last Name', value: user?.lastName || '', placeholder: 'Last name' },
                  { label: 'Workshop Name', value: user?.workshopName || '', placeholder: 'Workshop name' },
                  { label: 'Specialization', value: user?.specialization || '', placeholder: 'e.g. Engine Repair' },
                  { label: 'Experience (years)', value: user?.experienceYears || '', placeholder: 'e.g. 5' },
                  { label: 'Workshop Location', value: user?.workshopLocation || '', placeholder: 'City, Province' },
                  { label: 'Phone', value: user?.phone || '', placeholder: '+94 XX XXX XXXX' },
                  { label: 'Email', value: user?.email || '', placeholder: 'email@example.com' },
                ].map(field => (
                  <div key={field.label} className="sd-form-field">
                    <label className="sd-form-label">{field.label}</label>
                    <input className="sd-form-input" defaultValue={field.value} placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h3 className="sd-shop-name">{user?.workshopName || user?.specialization || 'My Workshop'}</h3>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0' }}>
                  👤 {user?.firstName} {user?.lastName}
                </p>
                {user?.specialization && <p style={{ color: '#D97706', fontWeight: 600, fontSize: '14px', margin: '4px 0' }}>🔧 {user.specialization}</p>}
                {user?.experienceYears && <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0' }}>📅 {user.experienceYears} years experience</p>}
                {user?.workshopLocation && <p className="sd-shop-location">📍 {user.workshopLocation}</p>}
                <div className="sd-shop-meta">
                  {user?.phone && <span>📞 {user.phone}</span>}
                  <span>✉️ {user?.email}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sd-profile-side">
          <div className="sd-card sd-profile-stats">
            <h4 className="sd-card-title" style={{ marginBottom: 16 }}>Workshop Statistics</h4>
            {[
              { label: 'Total Jobs', value: MOCK_REQUESTS.length, icon: '🔧' },
              { label: 'Completed', value: MOCK_REQUESTS.filter(r => r.status === 'completed').length, icon: '✅' },
              { label: 'Total Earnings', value: fmt(MOCK_REQUESTS.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0)), icon: '💰' },
              { label: 'Rating', value: '4.8 ⭐', icon: '🏆' },
            ].map(stat => (
              <div key={stat.label} className="sd-profile-stat-row">
                <span className="sd-profile-stat-icon">{stat.icon}</span>
                <div>
                  <div className="sd-profile-stat-val">{stat.value}</div>
                  <div className="sd-profile-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sd-card" style={{ padding: 20 }}>
            <h4 className="sd-card-title" style={{ marginBottom: 12 }}>Account Status</h4>
            <div className="sd-badge" style={{ background: '#ECFDF5', color: '#059669', fontSize: 13, padding: '6px 14px' }}>
              ✅ Verified Mechanic
            </div>
            <p className="sd-profile-stat-label" style={{ marginTop: 12 }}>
              Member since {new Date().toLocaleDateString('en-LK', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Mechanic Dashboard ────────────────────────────────────────────────────
const MechanicDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getInitials = () => {
    const f = user?.firstName?.charAt(0) || '';
    const l = user?.lastName?.charAt(0) || '';
    return (f + l).toUpperCase();
  };

  const NAV_ITEMS: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'requests', label: 'Requests', icon: '📋', badge: MOCK_REQUESTS.filter(r => r.status === 'pending').length },
    { id: 'services', label: 'My Services', icon: '🔧' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'profile', label: 'Workshop Profile', icon: '🏭' },
  ];

  return (
    <div className="sd-wrapper">
      {/* ── Sidebar ── */}
      <aside className={`sd-sidebar ${sidebarOpen ? 'sd-sidebar-open' : ''}`} style={{ background: 'linear-gradient(180deg, #78350F 0%, #92400E 50%, #B45309 100%)' }}>
        {/* Brand */}
        <div className="sd-sidebar-brand">
          <div className="sd-sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15" />
              <path d="M8 22 C10 16,14 12,18 12 C22 12,26 16,28 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="10" cy="24" r="3" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="26" cy="24" r="3" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M13 24 L23 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="sd-sidebar-app">Finding Moto</div>
            <div className="sd-sidebar-role">Mechanic Dashboard</div>
          </div>
        </div>

        {/* User info */}
        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar" style={{ background: 'rgba(217, 119, 6, 0.3)', color: '#FDE68A' }}>{getInitials()}</div>
          <div>
            <div className="sd-sidebar-username">{user?.firstName} {user?.lastName}</div>
            <div className="sd-sidebar-shop">{user?.workshopName || user?.specialization || 'Mechanic'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sd-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sd-nav-item ${activeTab === item.id ? 'sd-nav-item-active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="sd-nav-icon">{item.icon}</span>
              <span className="sd-nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="sd-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Change Password Link */}
        <button className="sd-nav-item" onClick={() => navigate('/change-password')} style={{ marginTop: '8px' }}>
          <span className="sd-nav-icon">🔒</span>
          <span className="sd-nav-label">Change Password</span>
        </button>

        {/* Logout */}
        <button className="sd-nav-logout" onClick={handleLogout}>
          <span>🚪</span> Sign Out
        </button>
      </aside>

      {/* ── Overlay for mobile ── */}
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main area ── */}
      <div className="sd-main">
        {/* Top bar */}
        <header className="sd-topbar">
          <button className="sd-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <div className="sd-topbar-title">
            {NAV_ITEMS.find(n => n.id === activeTab)?.icon}{' '}
            {NAV_ITEMS.find(n => n.id === activeTab)?.label}
          </div>
          <div className="sd-topbar-right">
            <button className="sd-icon-btn" title="Notifications">🔔</button>
            <div className="sd-topbar-avatar" onClick={() => setActiveTab('profile')} style={{ background: '#FFFBEB', color: '#D97706' }}>{getInitials()}</div>
          </div>
        </header>

        {/* Page content */}
        <div className="sd-page">
          {activeTab === 'overview'  && <OverviewTab user={user} />}
          {activeTab === 'requests'  && <ServiceRequestsTab />}
          {activeTab === 'services'  && <MyServicesTab />}
          {activeTab === 'schedule'  && <ScheduleTab />}
          {activeTab === 'profile'   && <WorkshopProfileTab user={user} />}
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
