import { useState, useEffect } from 'react'
import { FiSearch, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/Pages.css'

interface OrderData {
  id: number;
  customer_name: string;
  total: string;
  status: string;
  created_at: string;
}

function Orders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'success'
      case 'In Transit':
        return 'info'
      case 'Processing':
        return 'warning'
      case 'Pending':
        return 'secondary'
      default:
        return 'light'
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders Management</h1>
        <button className="btn btn-primary">+ New Order</button>
      </div>

      <div className="search-bar">
        <FiSearch />
        <input type="text" placeholder="Search orders..." />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td>{order.customer_name}</td>
                <td className="amount">${order.total}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-icon view">
                    <FiEye />
                  </button>
                  <button className="btn-icon edit">
                    <FiEdit2 />
                  </button>
                  <button className="btn-icon delete">
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
        <span>Page 1 of 8</span>
        <button className="btn btn-sm">Next</button>
      </div>
    </div>
  )
}

export default Orders
