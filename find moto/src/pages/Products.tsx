import { useState, useEffect } from 'react'
import { FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../styles/Pages.css'

interface ProductData {
  id: number;
  name: string;
  price: string;
  stock: number;
  status: string;
  business_name: string;
}

function Products() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    if (token) fetchProducts();
  }, [token]);

  const getStockColor = (stock: number) => {
    if (stock > 20) return 'success'
    if (stock > 10) return 'warning'
    return 'danger'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn btn-primary">+ Add Product</button>
      </div>

      <div className="search-bar">
        <FiSearch />
        <input type="text" placeholder="Search products..." />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Seller (Business)</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>#{product.id}</td>
                <td>{product.name}</td>
                <td>{product.business_name}</td>
                <td>${product.price}</td>
                <td>
                  <span className={`stock-badge ${getStockColor(product.stock)}`}>
                    {product.stock} units
                  </span>
                </td>
                <td>
                  <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                    {product.status}
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
        <span>Page 1 of 3</span>
        <button className="btn btn-sm">Next</button>
      </div>
    </div>
  )
}

export default Products
