import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiUsers, FiShoppingCart, FiBarChart3, FiPackage, FiCheckSquare, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/Sidebar.css'

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <h2>🚗 AutoAI</h2>
          <p>Admin Dashboard</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
        >
          <FiHome className="icon" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/users"
          className={`nav-item ${isActive('/users') ? 'active' : ''}`}
        >
          <FiUsers className="icon" />
          <span>Users</span>
        </Link>

        <Link
          to="/sellers"
          className={`nav-item ${isActive('/sellers') ? 'active' : ''}`}
        >
          <FiCheckSquare className="icon" />
          <span>Seller Approval</span>
        </Link>

        <Link
          to="/products"
          className={`nav-item ${isActive('/products') ? 'active' : ''}`}
        >
          <FiPackage className="icon" />
          <span>Products</span>
        </Link>

        <Link
          to="/orders"
          className={`nav-item ${isActive('/orders') ? 'active' : ''}`}
        >
          <FiShoppingCart className="icon" />
          <span>Orders</span>
        </Link>

        <Link
          to="/reports"
          className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
        >
          <FiBarChart3 className="icon" />
          <span>Reports</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout-btn" style={{ width: '100%', border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', fontSize: '15px' }}>
          <FiLogOut className="icon" />
          <span>Logout</span>
        </button>
        <p style={{ padding: '0 20px', marginTop: '10px', fontSize: '12px', color: '#666' }}>© 2026 AutoAI</p>
      </div>
    </div>
  )
}

export default Sidebar
