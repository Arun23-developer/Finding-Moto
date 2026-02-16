import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

interface FormData {
  email: string;
  password: string;
}

const ROLE_LABELS: Record<string, { icon: string; label: string }> = {
  buyer: { icon: '🛒', label: 'Buyer' },
  seller: { icon: '🏪', label: 'Seller' },
  mechanic: { icon: '🔧', label: 'Mechanic' },
  admin: { icon: '⚙️', label: 'Admin' }
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [approvalInfo, setApprovalInfo] = useState<{ status: string; role: string; message: string } | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<{ email: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setApprovalInfo(null);
    setVerificationInfo(null);
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.requiresVerification) {
        setVerificationInfo({
          email: data.email,
          message: data.message
        });
      } else if (data?.approvalStatus) {
        setApprovalInfo({
          status: data.approvalStatus,
          role: data.role,
          message: data.message
        });
      } else {
        setError(data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setApprovalInfo(null);
    setLoading(true);
    try {
      await googleAuth(credentialResponse.credential);
      navigate('/dashboard');
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.approvalStatus) {
        setApprovalInfo({
          status: data.approvalStatus,
          role: data.role,
          message: data.message
        });
      } else {
        setError(data?.message || 'Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#4F46E5"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Finding Moto</h1>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Email verification needed */}
        {verificationInfo && (
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            marginBottom: '16px',
            backgroundColor: '#DBEAFE',
            border: '1px solid #93C5FD'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>📧</span>
              <strong style={{ color: '#1E40AF', fontSize: '14px' }}>Email Verification Required</strong>
            </div>
            <p style={{ color: '#1E40AF', fontSize: '13px', margin: '0 0 12px' }}>
              {verificationInfo.message}
            </p>
            <Link
              to="/register"
              state={{ verifyEmail: verificationInfo.email }}
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Enter Verification Code
            </Link>
          </div>
        )}

        {/* Approval status message */}
        {approvalInfo && (
          <div style={{
            padding: '16px',
            borderRadius: '10px',
            marginBottom: '16px',
            backgroundColor: approvalInfo.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
            border: `1px solid ${approvalInfo.status === 'pending' ? '#FCD34D' : '#FECACA'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>
                {approvalInfo.status === 'pending' ? '⏳' : '❌'}
              </span>
              <strong style={{ color: approvalInfo.status === 'pending' ? '#92400E' : '#991B1B', fontSize: '14px' }}>
                {approvalInfo.status === 'pending' ? 'Account Pending Approval' : 'Account Not Approved'}
              </strong>
            </div>
            <p style={{ color: approvalInfo.status === 'pending' ? '#92400E' : '#991B1B', fontSize: '13px', margin: 0 }}>
              {approvalInfo.message}
            </p>
            {approvalInfo.role && ROLE_LABELS[approvalInfo.role] && (
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>
                Role: {ROLE_LABELS[approvalInfo.role].icon} {ROLE_LABELS[approvalInfo.role].label}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="btn-spinner"></span> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size="large"
            width="100%"
            theme="outline"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
