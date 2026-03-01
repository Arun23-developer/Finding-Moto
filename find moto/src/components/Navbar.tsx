import { FiBell, FiSettings, FiLogOut } from 'react-icons/fi'
import '../styles/Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h3>Dashboard</h3>
      </div>

      <div className="navbar-right">
        <div className="navbar-item">
          <FiBell size={20} />
          <span className="notification-badge">3</span>
        </div>

        <div className="navbar-item">
          <FiSettings size={20} />
        </div>

        <div className="user-profile">
          <div className="avatar">Admin</div>
          <div className="user-info">
            <p className="user-name">John Doe</p>
            <p className="user-role">Administrator</p>
          </div>
        </div>

        <div className="navbar-item">
          <FiLogOut size={20} />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
