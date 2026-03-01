// Navigation items configuration
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'FiHome' },
  { path: '/users', label: 'Users', icon: 'FiUsers' },
  { path: '/products', label: 'Products', icon: 'FiPackage' },
  { path: '/orders', label: 'Orders', icon: 'FiShoppingCart' },
  { path: '/reports', label: 'Reports', icon: 'FiBarChart3' },
]

// Color constants
export const COLORS = {
  primary: '#007bff',
  success: '#28a745',
  warning: '#fd7e14',
  danger: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  purple: '#9b59b6',
}

// Status mappings
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'danger',
  pending: 'warning',
  processing: 'info',
  delivered: 'success',
  'in-transit': 'info',
}

// Sample data - Replace with API calls in production
export const MOCK_USERS = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1-234-567-8900', status: 'Active', joined: '2024-01-15' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-234-567-8901', status: 'Active', joined: '2024-02-20' },
  { id: 3, name: 'Mike Brown', email: 'mike@example.com', phone: '+1-234-567-8902', status: 'Inactive', joined: '2024-01-10' },
  { id: 4, name: 'Emma Davis', email: 'emma@example.com', phone: '+1-234-567-8903', status: 'Active', joined: '2024-03-05' },
  { id: 5, name: 'David Wilson', email: 'david@example.com', phone: '+1-234-567-8904', status: 'Active', joined: '2024-02-28' },
  { id: 6, name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+1-234-567-8905', status: 'Inactive', joined: '2024-01-22' },
]

export const MOCK_PRODUCTS = [
  { id: 1, name: 'Tesla Model 3', brand: 'Tesla', price: '$45,000', stock: 25, rating: 4.8, category: 'Electric' },
  { id: 2, name: 'BMW i7', brand: 'BMW', price: '$85,000', stock: 12, rating: 4.7, category: 'Electric' },
  { id: 3, name: 'Mercedes EQS', brand: 'Mercedes', price: '$95,000', stock: 8, rating: 4.9, category: 'Electric' },
  { id: 4, name: 'Audi Q5', brand: 'Audi', price: '$55,000', stock: 18, rating: 4.6, category: 'Hybrid' },
  { id: 5, name: 'Toyota Prius', brand: 'Toyota', price: '$28,000', stock: 35, rating: 4.5, category: 'Hybrid' },
  { id: 6, name: 'Honda Accord', brand: 'Honda', price: '$32,000', stock: 22, rating: 4.4, category: 'Sedan' },
]

export const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'John Smith', product: 'Tesla Model 3', amount: '$45,000', date: '2024-01-15', status: 'Delivered' },
  { id: 'ORD-002', customer: 'Sarah Johnson', product: 'BMW i7', amount: '$85,000', date: '2024-02-20', status: 'In Transit' },
  { id: 'ORD-003', customer: 'Mike Brown', product: 'Mercedes EQS', amount: '$95,000', date: '2024-03-05', status: 'Processing' },
  { id: 'ORD-004', customer: 'Emma Davis', product: 'Audi Q5', amount: '$55,000', date: '2024-03-10', status: 'Delivered' },
  { id: 'ORD-005', customer: 'David Wilson', product: 'Toyota Prius', amount: '$28,000', date: '2024-03-12', status: 'Pending' },
  { id: 'ORD-006', customer: 'Lisa Anderson', product: 'Honda Accord', amount: '$32,000', date: '2024-03-14', status: 'Processing' },
]

export const MOCK_SALES_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  sales: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 32000, 35000, 38000, 40000, 45000],
  orders: [120, 190, 150, 250, 220, 300, 280, 320, 350, 380, 400, 450],
}

// Dashboard metrics
export const DASHBOARD_METRICS = {
  revenue: '$124,500',
  revenueChange: '+12.5%',
  activeUsers: '8,240',
  usersChange: '+8.2%',
  totalOrders: '3,120',
  ordersChange: '+15.3%',
  growthRate: '23.5%',
  growthChange: '+5.1%',
}

// API endpoints (for future use)
export const API_ENDPOINTS = {
  users: '/api/users',
  products: '/api/products',
  orders: '/api/orders',
  reports: '/api/reports',
  dashboard: '/api/dashboard',
}

// Pagination
export const PAGINATION = {
  itemsPerPage: 10,
  defaultPage: 1,
}
