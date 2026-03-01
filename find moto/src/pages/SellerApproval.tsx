import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

interface Seller {
    id: number;
    business_name: string;
    name: string;
    email: string;
    created_at: string;
    status: string;
}

const SellerApproval = () => {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchPendingSellers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/sellers/pending', {
                headers: { Authorization: \`Bearer \${token}\` }
      });
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Failed to fetch pending sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const handleApproval = async (id: number, status: 'approved' | 'rejected') => {
    if (!window.confirm(\`Are you sure you want to \${status} this seller?\`)) return;

    try {
      const response = await fetch(\`http://localhost:5000/api/admin/sellers/\${id}/approve\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setSellers(sellers.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error(\`Failed to \${status} seller:\`, error);
    }
  };

  if (loading) return <div>Loading sellers...</div>;

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <h2>Seller Approval</h2>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Business Name</th>
              <th>Owner Name</th>
              <th>Email</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">No pending seller approvals.</td>
              </tr>
            ) : (
              sellers.map((seller) => (
                <tr key={seller.id}>
                  <td><strong>{seller.business_name}</strong></td>
                  <td>{seller.name}</td>
                  <td>{seller.email}</td>
                  <td>{new Date(seller.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-success" 
                        onClick={() => handleApproval(seller.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-sm btn-danger ms-2"
                        onClick={() => handleApproval(seller.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerApproval;
