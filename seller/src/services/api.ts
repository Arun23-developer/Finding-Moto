import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('seller_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('seller_token');
    }
    return Promise.reject(error);
  }
);

// ─── Product types ─────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  seller: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  views: number;
  sales: number;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images?: string[];
  sku?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

// ─── Overview types ────────────────────────────────────────────────────────
export interface OverviewStats {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
}

export interface RecentOrder {
  _id: string;
  buyer?: { name?: string; email?: string };
  items?: { product: string; qty: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OverviewData {
  stats: OverviewStats;
  recentOrders: RecentOrder[];
  topProducts: Product[];
}

// ─── API calls ─────────────────────────────────────────────────────────────

// Products
export const fetchProducts = (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
  api.get<PaginatedResponse<Product>>('/seller/products', { params });

export const createProduct = (data: ProductFormData) =>
  api.post<{ success: boolean; data: Product }>('/seller/products', data);

export const updateProduct = (id: string, data: Partial<ProductFormData>) =>
  api.put<{ success: boolean; data: Product }>(`/seller/products/${id}`, data);

export const deleteProduct = (id: string) =>
  api.delete<{ success: boolean; message: string }>(`/seller/products/${id}`);

// Image upload
export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('image', file);
  const res = await api.post<{ success: boolean; data: { url: string } }>('/seller/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url;
};

// Overview / Dashboard
export const fetchOverview = () =>
  api.get<{ success: boolean; data: OverviewData }>('/seller/overview');

// Orders
export const fetchOrders = (params?: { page?: number; limit?: number; status?: string }) =>
  api.get('/seller/orders', { params });

// Helper: resolve image URL (handles both relative uploads and full URLs)
export const resolveImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url}`;
};

export default api;
