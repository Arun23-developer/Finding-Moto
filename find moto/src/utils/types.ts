export interface User {
  id: number
  name: string
  email: string
  phone: string
  status: 'Active' | 'Inactive'
  joined: string
}

export interface Product {
  id: number
  name: string
  brand: string
  price: string
  stock: number
  rating: number
  category: string
}

export interface Order {
  id: string
  customer: string
  product: string
  amount: string
  date: string
  status: 'Pending' | 'Processing' | 'In Transit' | 'Delivered'
}

export interface DashboardMetric {
  title: string
  value: string | number
  change: string
  color: 'blue' | 'green' | 'orange' | 'purple'
}

export interface NavigationItem {
  path: string
  label: string
  icon: string
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string | string[]
    tension?: number
    fill?: boolean
  }>
}

export interface SalesResponse {
  monthly_sales: ChartData
  total_revenue: number
  total_orders: number
  active_users: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}
