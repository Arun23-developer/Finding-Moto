import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 'buyer' | 'seller' | 'mechanic' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
//       "approvalStatus": "pending", // or "approved", "rejected"

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  // Seller fields
  shopName?: string;
  shopDescription?: string;
  shopLocation?: string;
  // Mechanic fields
  specialization?: string;
  experienceYears?: number;
  workshopLocation?: string;
  workshopName?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  // Seller fields
  shopName?: string;
  shopDescription?: string;
  shopLocation?: string;
  // Mechanic fields
  specialization?: string;
  experienceYears?: number;
  workshopLocation?: string;
  workshopName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  googleAuth: (credential: string) => Promise<any>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  isBuyer: boolean;
  isSeller: boolean;
  isMechanic: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    // OTP flow: no token returned, user needs to verify email first
    return response.data;
  };

  const googleAuth = async (credential: string) => {
    const response = await api.post('/auth/google', { credential });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const verifyOTP = async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    // If token is returned (buyer auto-approved), set auth state
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const resendOTP = async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  };

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.put('/auth/profile', data);
    setUser(response.data.user);
    return response.data;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    googleAuth,
    verifyOTP,
    resendOTP,
    logout,
    updateProfile,
    changePassword,
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    isMechanic: user?.role === 'mechanic',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
