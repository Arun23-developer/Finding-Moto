import { useState, useEffect } from 'react'
import { FiSearch, FiEdit2, FiTrash2, FiShieldOff, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/Pages.css'

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleBlock = async (id: number) => {
    if (!window.confirm('Toggle block status for this user?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/users/${id}/block`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Permanently delete user?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users Management</h1>
        <button className="btn btn-primary">+ Add User</button>
      </div>

      <div className="search-bar">
        <FiSearch />
        <input type="text" placeholder="Search users..." />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="badge bg-secondary">{user.role}</span></td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => toggleBlock(user.id)} title="Toggle Block">
                    {user.status === 'active' ? <FiShieldOff color="orange" /> : <FiCheckCircle color="green" />}
                  </button>
                  <button className="btn-icon delete" onClick={() => deleteUser(user.id)} title="Delete User">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="btn btn-sm">Previous</button>
        <span>Page 1 of 5</span>
        <button className="btn btn-sm">Next</button>
      </div>
    </div>
  )
}

export default Users
