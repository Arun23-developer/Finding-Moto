import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_CONFIG = {
  buyer: {
    icon: '🛒',
    label: 'Buyer',
    color: '#4F46E5',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    quickActions: [
      { label: 'Browse Products', icon: '🏍️', description: 'Find motorcycles & parts' },
      { label: 'My Orders', icon: '📦', description: 'Track your purchases' },
      { label: 'Find Mechanic', icon: '🔧', description: 'Book repair services' }
    ]
  },
  seller: {
    icon: '🏪',
    label: 'Seller',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    quickActions: [
      { label: 'My Listings', icon: '📋', description: 'Manage your products' },
      { label: 'Add Product', icon: '➕', description: 'List a new item' },
      { label: 'Orders', icon: '📦', description: 'Manage incoming orders' }
    ]
  },
  mechanic: {
    icon: '🔧',
    label: 'Mechanic',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    quickActions: [
      { label: 'Service Requests', icon: '📝', description: 'View pending requests' },
      { label: 'My Services', icon: '⚙️', description: 'Manage your services' },
      { label: 'Schedule', icon: '📅', description: 'View your appointments' }
    ]
  },
  admin: {
    icon: '⚙️',
    label: 'Admin',
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    quickActions: [
      { label: 'Pending Approvals', icon: '✅', description: 'Review new accounts' },
      { label: 'Manage Users', icon: '👥', description: 'User administration' },
      { label: 'Analytics', icon: '📊', description: 'Platform insights' }
    ]
  }
};

const Dashboard: React.FC = () => {
  const { user, logout, isSeller, isMechanic } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (): string => {
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const roleConfig = user ? ROLE_CONFIG[user.role] || ROLE_CONFIG.buyer : ROLE_CONFIG.buyer;

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#4F46E5"/>
            <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Finding Moto</span>
        </div>
        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-avatar-placeholder">{getInitials()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="nav-username">
                {user?.fullName || `${user?.firstName} ${user?.lastName}`}
              </span>
              <span style={{
                fontSize: '11px',
                padding: '1px 8px',
                borderRadius: '9999px',
                backgroundColor: `${roleConfig.color}18`,
                color: roleConfig.color,
                fontWeight: 600
              }}>
                {roleConfig.icon} {roleConfig.label}
              </span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Banner */}
        <div className="dashboard-welcome" style={{
          background: roleConfig.gradient,
          borderRadius: '16px',
          padding: '32px',
          color: '#fff',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#fff', margin: 0 }}>{getGreeting()}, {user?.firstName}!</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '8px', fontSize: '15px' }}>
                Welcome to your {roleConfig.label} dashboard.
              </p>
            </div>
            <span style={{ fontSize: '56px', opacity: 0.3 }}>{roleConfig.icon}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon card-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>Profile</h3>
            <p className="card-detail">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
            <p className="card-sub">{user?.email}</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon card-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3>Account Status</h3>
            <p className="card-detail status-active" style={{ color: roleConfig.color }}>
              {user?.approvalStatus === 'approved' ? 'Active' : user?.approvalStatus === 'pending' ? 'Pending' : 'Inactive'}
            </p>
            <p className="card-sub">
              {user?.approvalStatus === 'approved' ? 'Your account is verified' : 'Awaiting admin approval'}
            </p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon card-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>Member Since</h3>
            <p className="card-detail">
              {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <p className="card-sub">{roleConfig.icon} {roleConfig.label} account</p>
          </div>
        </div>

        {/* Role-Specific Info */}
        {isSeller && user?.shopName && (
          <div className="dashboard-section" style={{ marginTop: '24px' }}>
            <h2>Shop Details</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>🏪 Shop Name</h3>
                <p className="card-detail">{user.shopName}</p>
                {user.shopLocation && <p className="card-sub">📍 {user.shopLocation}</p>}
              </div>
              {user.shopDescription && (
                <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                  <h3>📝 Description</h3>
                  <p className="card-sub">{user.shopDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isMechanic && user?.specialization && (
          <div className="dashboard-section" style={{ marginTop: '24px' }}>
            <h2>Workshop Details</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>🔧 Specialization</h3>
                <p className="card-detail">{user.specialization}</p>
                {user.experienceYears && <p className="card-sub">{user.experienceYears} years experience</p>}
              </div>
              {user.workshopName && (
                <div className="dashboard-card">
                  <h3>🏭 Workshop</h3>
                  <p className="card-detail">{user.workshopName}</p>
                  {user.workshopLocation && <p className="card-sub">📍 {user.workshopLocation}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section" style={{ marginTop: '24px' }}>
          <h2>Quick Actions</h2>
          <div className="actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {roleConfig.quickActions.map((action, index) => (
              <button key={index} className="action-btn" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '28px' }}>{action.icon}</span>
                <strong style={{ fontSize: '14px', color: '#1F2937' }}>{action.label}</strong>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{action.description}</span>
              </button>
            ))}
            <button className="action-btn" onClick={handleLogout} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #FEE2E2',
              backgroundColor: '#FEF2F2',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <strong style={{ fontSize: '14px', color: '#DC2626' }}>Sign Out</strong>
              <span style={{ fontSize: '12px', color: '#EF4444' }}>Logout from account</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
