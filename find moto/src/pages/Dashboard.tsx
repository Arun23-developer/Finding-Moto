import { useState, useEffect } from 'react'
import { FiDollarSign, FiUsers, FiShoppingCart, FiTrendingUp } from 'react-icons/fi'
import SummaryCard from '../components/SummaryCard'
import SalesChart from '../components/SalesChart'
import { useAuth } from '../context/AuthContext'
import '../styles/Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    monthlySales: []
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    if (token) fetchStats();
  }, [token]);
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to AutoAI Admin Dashboard</h1>
        <p className="subtitle">Track your marketplace performance in real-time</p>
      </div>

      <div className="summary-cards">
        <SummaryCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change="Real-time"
          icon={<FiDollarSign size={32} />}
          color="blue"
        />
        <SummaryCard
          title="Users"
          value={stats.totalUsers.toLocaleString()}
          change="Real-time"
          icon={<FiUsers size={32} />}
          color="green"
        />
        <SummaryCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change="Real-time"
          icon={<FiTrendingUp size={32} />}
          color="purple"
        />
        <SummaryCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change="Real-time"
          icon={<FiShoppingCart size={32} />}
          color="orange"
        />
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <SalesChart type="line" dataPoints={stats.monthlySales.length > 0 ? stats.monthlySales : undefined} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>Top Selling Models</h3>
          <div className="stat-item">
            <span>Tesla Model S</span>
            <span className="badge">2,450 units</span>
          </div>
          <div className="stat-item">
            <span>BMW i7</span>
            <span className="badge">1,890 units</span>
          </div>
          <div className="stat-item">
            <span>Audi Q5</span>
            <span className="badge">1,620 units</span>
          </div>
          <div className="stat-item">
            <span>Mercedes EQS</span>
            <span className="badge">1,340 units</span>
          </div>
        </div>

        <div className="stat-box">
          <h3>Recent Activity</h3>
          <div className="activity-item">
            <span className="activity-badge success">✓</span>
            <div>
              <p>New order placed</p>
              <small>2 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-badge info">ℹ</span>
            <div>
              <p>User registered</p>
              <small>15 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-badge warning">!</span>
            <div>
              <p>Inventory alert</p>
              <small>45 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-badge success">✓</span>
            <div>
              <p>Payment received</p>
              <small>1 hour ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
