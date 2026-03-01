import SalesChart from '../components/SalesChart'
import '../styles/Pages.css'

function Reports() {
  const reportData = [
    { month: 'January', sales: '$45,000', orders: 250, users: 180, growth: '+5%' },
    { month: 'February', sales: '$52,000', orders: 290, users: 215, growth: '+8%' },
    { month: 'March', sales: '$68,000', orders: 380, users: 310, growth: '+12%' },
    { month: 'April', sales: '$85,000', orders: 450, users: 420, growth: '+15%' },
    { month: 'May', sales: '$95,000', orders: 520, users: 510, growth: '+18%' },
    { month: 'June', sales: '$120,000', orders: 640, users: 680, growth: '+22%' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="report-actions">
          <button className="btn btn-secondary">📊 Generate PDF</button>
          <button className="btn btn-secondary">📥 Export CSV</button>
        </div>
      </div>

      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <SalesChart type="bar" />
      </div>

      <div className="report-section">
        <h2>Monthly Performance Report</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Sales</th>
                <th>Total Orders</th>
                <th>New Users</th>
                <th>Growth Rate</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  <td>{row.month}</td>
                  <td className="amount">{row.sales}</td>
                  <td>{row.orders}</td>
                  <td>{row.users}</td>
                  <td>
                    <span className="growth positive">
                      {row.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <h3>Top Performing Region</h3>
          <p className="insight-value">North America</p>
          <p className="insight-text">45% of total revenue</p>
        </div>
        <div className="insight-card">
          <h3>Best Selling Category</h3>
          <p className="insight-value">Electric Vehicles</p>
          <p className="insight-text">58% of total sales</p>
        </div>
        <div className="insight-card">
          <h3>Average Order Value</h3>
          <p className="insight-value">$2,850</p>
          <p className="insight-text">+12% from last month</p>
        </div>
        <div className="insight-card">
          <h3>Customer Satisfaction</h3>
          <p className="insight-value">4.7/5.0</p>
          <p className="insight-text">Based on 1,240 reviews</p>
        </div>
      </div>
    </div>
  )
}

export default Reports
