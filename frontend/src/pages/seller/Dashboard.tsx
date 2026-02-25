import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'products' | 'orders' | 'analytics' | 'messages' | 'profile';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  views: number;
  sales: number;
  image: string;
}

interface Order {
  id: string;
  buyer: string;
  product: string;
  qty: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

interface Message {
  id: number;
  from: string;
  avatar: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'High-Performance Brake Pads Set', category: 'Brakes', price: 27000, stock: 45, status: 'active', views: 1240, sales: 78, image: '🔧' },
  { id: 2, name: 'LED Headlight Kit - Universal Fit', category: 'Electronics', price: 45000, stock: 12, status: 'active', views: 890, sales: 34, image: '💡' },
  { id: 3, name: 'Racing Exhaust System - Full Titanium', category: 'Performance', price: 240000, stock: 0, status: 'out_of_stock', views: 2100, sales: 9, image: '🏍️' },
  { id: 4, name: 'Carbon Fiber Mirror Set', category: 'Accessories', price: 37500, stock: 30, status: 'active', views: 560, sales: 22, image: '🪞' },
  { id: 5, name: 'Engine Oil Filter - Premium', category: 'Engine', price: 7500, stock: 200, status: 'active', views: 3400, sales: 189, image: '⚙️' },
  { id: 6, name: 'Sport Handlebar Grips', category: 'Accessories', price: 10500, stock: 0, status: 'inactive', views: 310, sales: 15, image: '🏁' },
];

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-1024', buyer: 'Ashan Perera', product: 'High-Performance Brake Pads Set', qty: 2, amount: 54000, status: 'pending', date: '2026-02-23' },
  { id: 'ORD-1023', buyer: 'Nimal Fernando', product: 'LED Headlight Kit', qty: 1, amount: 45000, status: 'shipped', date: '2026-02-22' },
  { id: 'ORD-1022', buyer: 'Kasun Silva', product: 'Engine Oil Filter - Premium', qty: 5, amount: 37500, status: 'delivered', date: '2026-02-21' },
  { id: 'ORD-1021', buyer: 'Dilani Rathnayake', product: 'Carbon Fiber Mirror Set', qty: 1, amount: 37500, status: 'confirmed', date: '2026-02-20' },
  { id: 'ORD-1020', buyer: 'Ruwan Jayasinghe', product: 'Sport Handlebar Grips', qty: 3, amount: 31500, status: 'cancelled', date: '2026-02-19' },
  { id: 'ORD-1019', buyer: 'Chamara Bandara', product: 'Engine Oil Filter - Premium', qty: 10, amount: 75000, status: 'delivered', date: '2026-02-18' },
];

const MOCK_MESSAGES: Message[] = [
  { id: 1, from: 'Ashan Perera', avatar: 'AP', subject: 'Brake Pads delivery time?', preview: 'Hi, when will my order ORD-1024 be dispatched?', time: '10 min ago', unread: true },
  { id: 2, from: 'Nimal Fernando', avatar: 'NF', subject: 'LED Kit compatibility', preview: 'Does the LED kit fit a Pulsar NS200?', time: '2 hrs ago', unread: true },
  { id: 3, from: 'Kasun Silva', avatar: 'KS', subject: 'Bulk order inquiry', preview: 'I want to order 20 oil filters. Any discount?', time: 'Yesterday', unread: false },
  { id: 4, from: 'Support Team', avatar: 'ST', subject: 'Your listing approved', preview: 'Your new product Racing Exhaust System has been approved.', time: '2 days ago', unread: false },
];

const WEEKLY_SALES = [18000, 32000, 24000, 45000, 38000, 56000, 72000];
const WEEKLY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => `LKR ${n.toLocaleString()}`;

const statusColor: Record<string, string> = {
  active: '#059669', inactive: '#6B7280', out_of_stock: '#DC2626',
  pending: '#D97706', confirmed: '#2563EB', shipped: '#7C3AED',
  delivered: '#059669', cancelled: '#DC2626',
};

const statusBg: Record<string, string> = {
  active: '#ECFDF5', inactive: '#F3F4F6', out_of_stock: '#FEF2F2',
  pending: '#FFFBEB', confirmed: '#EFF6FF', shipped: '#F5F3FF',
  delivered: '#ECFDF5', cancelled: '#FEF2F2',
};

const statusLabel: Record<string, string> = {
  active: 'Active', inactive: 'Inactive', out_of_stock: 'Out of Stock',
  pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped',
  delivered: 'Delivered', cancelled: 'Cancelled',
};

// ─── Sub-page components ──────────────────────────────────────────────────────
function OverviewTab({ user }: { user: any }) {
  const maxSale = Math.max(...WEEKLY_SALES);
  const totalRevenue = MOCK_ORDERS.filter(o => o.status === 'delivered').reduce((s, o) => s + o.amount, 0);
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  return (
    <div className="sd-content">
      {/* Welcome banner */}
      <div className="sd-welcome-banner">
        <div>
          <h1 className="sd-welcome-title">Welcome back, {user?.firstName}! 👋</h1>
          <p className="sd-welcome-sub">Here's what's happening with your shop today.</p>
        </div>
        <div className="sd-shop-chip">
          <span>🏪</span>
          <span>{user?.shopName || 'My Shop'}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="sd-kpi-grid">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), change: '+12.4%', icon: '💰', color: '#059669', bg: '#ECFDF5' },
          { label: 'Active Listings', value: `${MOCK_PRODUCTS.filter(p => p.status === 'active').length}`, change: '+2 this week', icon: '📋', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Pending Orders', value: `${pendingOrders}`, change: 'Need action', icon: '📦', color: '#D97706', bg: '#FFFBEB' },
          { label: 'Total Views', value: `${MOCK_PRODUCTS.reduce((s, p) => s + p.views, 0).toLocaleString()}`, change: '+8.1% this week', icon: '👁️', color: '#7C3AED', bg: '#F5F3FF' },
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

      {/* Weekly sales chart + recent orders side by side */}
      <div className="sd-row-2">
        {/* Bar chart */}
        <div className="sd-card sd-chart-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Weekly Sales</h3>
            <span className="sd-card-badge">This Week</span>
          </div>
          <div className="sd-bar-chart">
            {WEEKLY_SALES.map((val, i) => (
              <div key={i} className="sd-bar-col">
                <div
                  className="sd-bar"
                  style={{ height: `${(val / maxSale) * 100}%` }}
                  title={fmt(val)}
                >
                  <span className="sd-bar-tip">{fmt(val)}</span>
                </div>
                <span className="sd-bar-label">{WEEKLY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="sd-card sd-recent-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Recent Orders</h3>
            <span className="sd-card-badge sd-card-badge-green">{MOCK_ORDERS.filter(o => o.status === 'pending').length} Pending</span>
          </div>
          <div className="sd-order-list">
            {MOCK_ORDERS.slice(0, 5).map(order => (
              <div key={order.id} className="sd-order-row">
                <div className="sd-order-avatar">{order.buyer.charAt(0)}</div>
                <div className="sd-order-info">
                  <span className="sd-order-id">{order.id}</span>
                  <span className="sd-order-buyer">{order.buyer}</span>
                </div>
                <div className="sd-order-right">
                  <span className="sd-order-amount">{fmt(order.amount)}</span>
                  <span className="sd-badge" style={{ background: statusBg[order.status], color: statusColor[order.status] }}>
                    {statusLabel[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="sd-card" style={{ marginTop: 24 }}>
        <div className="sd-card-header">
          <h3 className="sd-card-title">Top Performing Products</h3>
        </div>
        <div className="sd-top-products">
          {MOCK_PRODUCTS.sort((a, b) => b.sales - a.sales).slice(0, 4).map(p => (
            <div key={p.id} className="sd-top-product-row">
              <div className="sd-top-product-icon">{p.image}</div>
              <div className="sd-top-product-info">
                <span className="sd-top-product-name">{p.name}</span>
                <span className="sd-top-product-cat">{p.category}</span>
              </div>
              <div className="sd-top-product-stats">
                <span className="sd-top-product-sales">{p.sales} sold</span>
                <span className="sd-top-product-price">{fmt(p.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="sd-content">
      {/* Header actions */}
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">My Products</h2>
          <p className="sd-page-sub">{MOCK_PRODUCTS.length} total listings</p>
        </div>
        <button className="sd-btn-primary">
          <span>+</span> Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="sd-filter-bar">
        <div className="sd-search-wrap">
          <span className="sd-search-icon">🔍</span>
          <input
            className="sd-search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="sd-filter-tabs">
          {['all', 'active', 'inactive', 'out_of_stock'].map(f => (
            <button
              key={f}
              className={`sd-filter-tab ${filter === f ? 'sd-filter-tab-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : statusLabel[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="sd-card sd-table-card">
        <table className="sd-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Views</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="sd-table-product">
                    <div className="sd-table-img">{p.image}</div>
                    <span className="sd-table-name">{p.name}</span>
                  </div>
                </td>
                <td><span className="sd-cat-chip">{p.category}</span></td>
                <td className="sd-table-price">{fmt(p.price)}</td>
                <td>
                  <span style={{ color: p.stock === 0 ? '#DC2626' : p.stock < 10 ? '#D97706' : '#059669', fontWeight: 600 }}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                  </span>
                </td>
                <td className="sd-table-muted">{p.views.toLocaleString()}</td>
                <td className="sd-table-muted">{p.sales}</td>
                <td>
                  <span className="sd-badge" style={{ background: statusBg[p.status], color: statusColor[p.status] }}>
                    {statusLabel[p.status]}
                  </span>
                </td>
                <td>
                  <div className="sd-table-actions">
                    <button className="sd-action-btn sd-action-edit">✏️</button>
                    <button className="sd-action-btn sd-action-delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="sd-empty-row">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = MOCK_ORDERS.filter(o => statusFilter === 'all' || o.status === statusFilter);

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Orders</h2>
          <p className="sd-page-sub">{MOCK_ORDERS.length} total orders</p>
        </div>
        <button className="sd-btn-outline">Export CSV</button>
      </div>

      {/* Summary strips */}
      <div className="sd-order-strips">
        {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map(s => {
          const count = MOCK_ORDERS.filter(o => o.status === s).length;
          return (
            <div key={s} className="sd-order-strip" style={{ borderLeft: `4px solid ${statusColor[s]}` }}>
              <span className="sd-strip-num" style={{ color: statusColor[s] }}>{count}</span>
              <span className="sd-strip-label">{statusLabel[s]}</span>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="sd-filter-tabs" style={{ marginBottom: 16 }}>
        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(f => (
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
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id}>
                <td className="sd-order-id-cell">{order.id}</td>
                <td>
                  <div className="sd-table-buyer">
                    <div className="sd-buyer-avatar">{order.buyer.charAt(0)}</div>
                    {order.buyer}
                  </div>
                </td>
                <td className="sd-table-name">{order.product}</td>
                <td className="sd-table-muted">×{order.qty}</td>
                <td className="sd-table-price">{fmt(order.amount)}</td>
                <td className="sd-table-muted">{order.date}</td>
                <td>
                  <span className="sd-badge" style={{ background: statusBg[order.status], color: statusColor[order.status] }}>
                    {statusLabel[order.status]}
                  </span>
                </td>
                <td>
                  {order.status === 'pending' && (
                    <button className="sd-btn-xs sd-btn-confirm">Confirm</button>
                  )}
                  {order.status === 'confirmed' && (
                    <button className="sd-btn-xs sd-btn-ship">Mark Shipped</button>
                  )}
                  {(order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled') && (
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

function AnalyticsTab() {
  const totalRevenue = MOCK_ORDERS.filter(o => o.status === 'delivered').reduce((s, o) => s + o.amount, 0);
  const maxSale = Math.max(...WEEKLY_SALES);
  const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
  const catSales = categories.map(c => ({
    category: c,
    sales: MOCK_PRODUCTS.filter(p => p.category === c).reduce((s, p) => s + p.sales, 0),
  })).sort((a, b) => b.sales - a.sales);
  const maxCatSales = Math.max(...catSales.map(c => c.sales));

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Analytics</h2>
          <p className="sd-page-sub">Performance overview for your shop</p>
        </div>
        <select className="sd-select">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
        </select>
      </div>

      {/* Summary strip */}
      <div className="sd-kpi-grid">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), icon: '💰', color: '#059669', bg: '#ECFDF5' },
          { label: 'Total Orders', value: `${MOCK_ORDERS.length}`, icon: '📦', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Products Sold', value: `${MOCK_PRODUCTS.reduce((s, p) => s + p.sales, 0)}`, icon: '📈', color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Total Views', value: `${MOCK_PRODUCTS.reduce((s, p) => s + p.views, 0).toLocaleString()}`, icon: '👁️', color: '#D97706', bg: '#FFFBEB' },
        ].map(kpi => (
          <div key={kpi.label} className="sd-kpi-card" style={{ borderTop: `4px solid ${kpi.color}` }}>
            <div className="sd-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div>
              <div className="sd-kpi-value">{kpi.value}</div>
              <div className="sd-kpi-label">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sd-row-2" style={{ marginTop: 24 }}>
        {/* Weekly sales chart */}
        <div className="sd-card sd-chart-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Sales Trend (This Week)</h3>
          </div>
          <div className="sd-bar-chart">
            {WEEKLY_SALES.map((val, i) => (
              <div key={i} className="sd-bar-col">
                <div className="sd-bar" style={{ height: `${(val / maxSale) * 100}%` }} title={fmt(val)}>
                  <span className="sd-bar-tip">{fmt(val)}</span>
                </div>
                <span className="sd-bar-label">{WEEKLY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="sd-card">
          <div className="sd-card-header" style={{ marginBottom: 16 }}>
            <h3 className="sd-card-title">Sales by Category</h3>
          </div>
          <div className="sd-cat-breakdown">
            {catSales.map(c => (
              <div key={c.category} className="sd-cat-row">
                <span className="sd-cat-name">{c.category}</span>
                <div className="sd-cat-bar-wrap">
                  <div className="sd-cat-bar-fill" style={{ width: `${(c.sales / maxCatSales) * 100}%` }} />
                </div>
                <span className="sd-cat-val">{c.sales} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesTab() {
  const [selected, setSelected] = useState<Message | null>(null);

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Messages</h2>
          <p className="sd-page-sub">{MOCK_MESSAGES.filter(m => m.unread).length} unread</p>
        </div>
      </div>

      <div className="sd-messages-layout">
        {/* Message list */}
        <div className="sd-card sd-msg-list">
          {MOCK_MESSAGES.map(msg => (
            <div
              key={msg.id}
              className={`sd-msg-item ${selected?.id === msg.id ? 'sd-msg-item-active' : ''} ${msg.unread ? 'sd-msg-unread' : ''}`}
              onClick={() => setSelected(msg)}
            >
              <div className="sd-msg-avatar">{msg.avatar}</div>
              <div className="sd-msg-body">
                <div className="sd-msg-top">
                  <span className="sd-msg-from">{msg.from}</span>
                  <span className="sd-msg-time">{msg.time}</span>
                </div>
                <div className="sd-msg-subject">{msg.subject}</div>
                <div className="sd-msg-preview">{msg.preview}</div>
              </div>
              {msg.unread && <div className="sd-msg-dot" />}
            </div>
          ))}
        </div>

        {/* Message detail */}
        <div className="sd-card sd-msg-detail">
          {selected ? (
            <>
              <div className="sd-msg-detail-header">
                <div className="sd-msg-detail-avatar">{selected.avatar}</div>
                <div>
                  <div className="sd-msg-from" style={{ fontSize: 16 }}>{selected.from}</div>
                  <div className="sd-msg-subject">{selected.subject}</div>
                </div>
              </div>
              <div className="sd-msg-detail-body">
                <p>{selected.preview}</p>
                <p className="sd-msg-detail-time">{selected.time}</p>
              </div>
              <div className="sd-msg-reply">
                <textarea className="sd-msg-textarea" placeholder="Type your reply..." rows={4} />
                <button className="sd-btn-primary" style={{ marginTop: 12 }}>Send Reply</button>
              </div>
            </>
          ) : (
            <div className="sd-msg-empty">
              <span style={{ fontSize: 48 }}>💬</span>
              <p>Select a message to read and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopProfileTab({ user }: { user: any }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="sd-content">
      <div className="sd-page-header">
        <div>
          <h2 className="sd-page-title">Shop Profile</h2>
          <p className="sd-page-sub">Manage your shop details and appearance</p>
        </div>
        <button className="sd-btn-primary" onClick={() => setEditing(!editing)}>
          {editing ? '💾 Save Changes' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="sd-profile-layout">
        {/* Shop info card */}
        <div className="sd-card sd-shop-card">
          <div className="sd-shop-banner">
            <div className="sd-shop-logo">🏪</div>
          </div>
          <div className="sd-shop-info">
            {editing ? (
              <div className="sd-form-grid">
                {[
                  { label: 'Shop Name', value: user?.shopName || '', placeholder: 'Enter shop name' },
                  { label: 'Location', value: user?.shopLocation || '', placeholder: 'City, Province' },
                  { label: 'Phone', value: user?.phone || '', placeholder: '+94 XX XXX XXXX' },
                  { label: 'Email', value: user?.email || '', placeholder: 'shop@email.com' },
                ].map(field => (
                  <div key={field.label} className="sd-form-field">
                    <label className="sd-form-label">{field.label}</label>
                    <input className="sd-form-input" defaultValue={field.value} placeholder={field.placeholder} />
                  </div>
                ))}
                <div className="sd-form-field sd-form-full">
                  <label className="sd-form-label">Description</label>
                  <textarea className="sd-form-input sd-form-textarea" defaultValue={user?.shopDescription || ''} placeholder="Tell buyers about your shop..." rows={4} />
                </div>
              </div>
            ) : (
              <>
                <h3 className="sd-shop-name">{user?.shopName || 'My Shop'}</h3>
                {user?.shopLocation && <p className="sd-shop-location">📍 {user.shopLocation}</p>}
                {user?.shopDescription && <p className="sd-shop-desc">{user.shopDescription}</p>}
                <div className="sd-shop-meta">
                  {user?.phone && <span>📞 {user.phone}</span>}
                  <span>✉️ {user?.email}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="sd-profile-side">
          <div className="sd-card sd-profile-stats">
            <h4 className="sd-card-title" style={{ marginBottom: 16 }}>Shop Statistics</h4>
            {[
              { label: 'Total Products', value: MOCK_PRODUCTS.length, icon: '📋' },
              { label: 'Total Orders', value: MOCK_ORDERS.length, icon: '📦' },
              { label: 'Total Sales', value: MOCK_PRODUCTS.reduce((s, p) => s + p.sales, 0), icon: '📈' },
              { label: 'Profile Views', value: '2,450', icon: '👁️' },
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
              ✅ Verified Seller
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

// ─── Main Seller Dashboard ────────────────────────────────────────────────────
const SellerDashboard: React.FC = () => {
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
    { id: 'products', label: 'Products', icon: '📋', badge: MOCK_PRODUCTS.length },
    { id: 'orders', label: 'Orders', icon: '📦', badge: MOCK_ORDERS.filter(o => o.status === 'pending').length },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'messages', label: 'Messages', icon: '💬', badge: MOCK_MESSAGES.filter(m => m.unread).length },
    { id: 'profile', label: 'Shop Profile', icon: '🏪' },
  ];

  return (
    <div className="sd-wrapper">
      {/* ── Sidebar ── */}
      <aside className={`sd-sidebar ${sidebarOpen ? 'sd-sidebar-open' : ''}`}>
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
            <div className="sd-sidebar-role">Seller Dashboard</div>
          </div>
        </div>

        {/* User info */}
        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{getInitials()}</div>
          <div>
            <div className="sd-sidebar-username">{user?.firstName} {user?.lastName}</div>
            <div className="sd-sidebar-shop">{user?.shopName || 'My Shop'}</div>
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
            <div className="sd-topbar-avatar" onClick={() => setActiveTab('profile')}>{getInitials()}</div>
          </div>
        </header>

        {/* Page content */}
        <div className="sd-page">
          {activeTab === 'overview'   && <OverviewTab user={user} />}
          {activeTab === 'products'   && <ProductsTab />}
          {activeTab === 'orders'     && <OrdersTab />}
          {activeTab === 'analytics'  && <AnalyticsTab />}
          {activeTab === 'messages'   && <MessagesTab />}
          {activeTab === 'profile'    && <ShopProfileTab user={user} />}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
