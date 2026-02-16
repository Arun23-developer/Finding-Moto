import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

// Strict email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  const blockedDomains = ['test.com', 'example.com', 'fake.com', 'temp.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com', 'yopmail.com', 'tempmail.com', 'trashmail.com'];
  const domain = email.split('@')[1].toLowerCase();
  if (blockedDomains.includes(domain)) return false;

  return true;
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: UserRole;
  // Seller fields
  shopName: string;
  shopDescription: string;
  shopLocation: string;
  // Mechanic fields
  specialization: string;
  experienceYears: string;
  workshopLocation: string;
  workshopName: string;
}

const ROLE_INFO: Record<string, { title: string; icon: string; description: string; color: string }> = {
  buyer: {
    title: 'Buyer',
    icon: '🛒',
    description: 'Browse and purchase motorcycles, parts & accessories',
    color: '#4F46E5'
  },
  seller: {
    title: 'Seller',
    icon: '🏪',
    description: 'List and sell motorcycles, parts & accessories',
    color: '#059669'
  },
  mechanic: {
    title: 'Mechanic',
    icon: '🔧',
    description: 'Offer repair and maintenance services',
    color: '#D97706'
  }
};

const Register: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 'otp'>(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'buyer',
    shopName: '',
    shopDescription: '',
    shopLocation: '',
    specialization: '',
    experienceYears: '',
    workshopLocation: '',
    workshopName: ''
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { register, googleAuth, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from login with unverified email, go straight to OTP step
  useEffect(() => {
    const state = location.state as { verifyEmail?: string } | null;
    if (state?.verifyEmail) {
      setFormData(prev => ({ ...prev, email: state.verifyEmail! }));
      setStep('otp');
      startResendCooldown();
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!isValidEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate role-specific fields
    if (formData.role === 'seller' && !formData.shopName.trim()) {
      setError('Shop name is required for sellers');
      return;
    }
    if (formData.role === 'mechanic' && !formData.specialization.trim()) {
      setError('Specialization is required for mechanics');
      return;
    }

    if (loading) return; // Prevent duplicate submissions
    setLoading(true);
    try {
      const registerData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role
      };

      if (formData.role === 'seller') {
        registerData.shopName = formData.shopName;
        registerData.shopDescription = formData.shopDescription || undefined;
        registerData.shopLocation = formData.shopLocation || undefined;
      }

      if (formData.role === 'mechanic') {
        registerData.specialization = formData.specialization;
        registerData.experienceYears = formData.experienceYears ? parseInt(formData.experienceYears) : undefined;
        registerData.workshopLocation = formData.workshopLocation || undefined;
        registerData.workshopName = formData.workshopName || undefined;
      }

      const result = await register(registerData);
      
      if (result.requiresVerification) {
        // Go to OTP verification step
        setStep('otp');
        startResendCooldown();
      } else if (result.token) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      await googleAuth(credentialResponse.credential);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  // OTP cooldown timer
  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpValues(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      const nextInput = document.getElementById(`otp-${nextIndex}`);
      nextInput?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
      const newOtp = [...otpValues];
      newOtp[index - 1] = '';
      setOtpValues(newOtp);
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setOtpError('');
    try {
      const result = await verifyOTP(formData.email, otp);
      if (result.token) {
        // Buyer - verified and auto-approved
        navigate('/dashboard');
      } else {
        // Seller/Mechanic - verified but pending approval
        setRegistrationSuccess(true);
        setSuccessMessage(result.message || 'Email verified! Your account is pending admin approval.');
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || 'Invalid verification code. Please try again.');
      setOtpValues(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setOtpError('');
    try {
      await resendOTP(formData.email);
      setOtpValues(['', '', '', '', '', '']);
      startResendCooldown();
      setOtpError('');
    } catch (error: any) {
      setOtpError(error.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      if (value && !isValidEmail(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
    setError('');
  };

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Validate basic fields before moving to step 3
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (!isValidEmail(formData.email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setError('');
      if (formData.role === 'buyer') {
        // Buyers don't need step 3
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setError('');
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  // Registration success screen for sellers/mechanics
  if (registrationSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#059669"/>
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Registration Successful!</h1>
            <div style={{ fontSize: '48px', margin: '16px 0' }}>
              {ROLE_INFO[formData.role].icon}
            </div>
            <h2>{ROLE_INFO[formData.role].title} Account Created</h2>
            <p className="auth-subtitle" style={{ marginTop: '12px', lineHeight: '1.6' }}>
              {successMessage}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            <Link to="/login" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Go to Login
            </Link>
            <Link to="/" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: step === 1 ? '520px' : '460px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#4F46E5"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Finding Moto</h1>
          <h2>Create your account</h2>
          <p className="auth-subtitle">
            {step === 1 && 'Choose how you want to use Finding Moto'}
            {step === 2 && 'Fill in your personal details'}
            {step === 3 && `Complete your ${ROLE_INFO[formData.role].title.toLowerCase()} profile`}
            {step === 'otp' && 'Enter the verification code sent to your email'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator" style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '16px 0' }}>
          {[1, 2, 3, 'otp'].map((s, i) => (
            <div
              key={i}
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: (() => {
                  const stepOrder = formData.role === 'buyer' ? [1, 2, 'otp'] : [1, 2, 3, 'otp'];
                  const currentIdx = stepOrder.indexOf(step);
                  const thisIdx = stepOrder.indexOf(s as any);
                  return thisIdx !== -1 && thisIdx <= currentIdx ? '#4F46E5' : '#E5E7EB';
                })(),
                transition: 'background-color 0.3s',
                display: (() => {
                  if (formData.role === 'buyer' && s === 3) return 'none';
                  return 'block';
                })()
              }}
            />
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
              {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`role-select-card ${formData.role === role ? 'role-selected' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    border: formData.role === role ? `2px solid ${ROLE_INFO[role].color}` : '2px solid #E5E7EB',
                    borderRadius: '12px',
                    backgroundColor: formData.role === role ? `${ROLE_INFO[role].color}10` : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    width: '100%',
                    outline: 'none'
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{ROLE_INFO[role].icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#1F2937' }}>
                      {ROLE_INFO[role].title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                      {ROLE_INFO[role].description}
                    </div>
                  </div>
                  {formData.role === role && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={ROLE_INFO[role].color} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <button type="button" className="btn-primary" onClick={nextStep} style={{ width: '100%' }}>
              Continue as {ROLE_INFO[formData.role].title}
            </button>

            {/* Google sign-in for buyers only */}
            {formData.role === 'buyer' && (
              <>
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
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>
              </>
            )}

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <form onSubmit={formData.role === 'buyer' ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" name="firstName" placeholder="John"
                  value={formData.firstName} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" type="text" name="lastName" placeholder="Doe"
                  value={formData.lastName} onChange={handleChange} required disabled={loading} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required disabled={loading}
                className={emailError ? 'input-error' : ''} />
              {emailError && <span className="field-error">{emailError}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
              <input id="phone" type="tel" name="phone" placeholder="+1 234 567 8900"
                value={formData.phone} onChange={handleChange} disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" placeholder="Min. 6 characters"
                value={formData.password} onChange={handleChange} required minLength={6} disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" name="confirmPassword" placeholder="Re-enter your password"
                value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={prevStep} style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? (
                  <><span className="btn-spinner"></span> Creating account...</>
                ) : formData.role === 'buyer' ? (
                  'Create Account'
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Role-specific fields (Seller or Mechanic) */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="auth-form">
            {formData.role === 'seller' && (
              <>
                <div className="form-group">
                  <label htmlFor="shopName">Shop Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="shopName" type="text" name="shopName" placeholder="e.g. Moto Parts Hub"
                    value={formData.shopName} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="shopDescription">Shop Description</label>
                  <textarea id="shopDescription" name="shopDescription" placeholder="Describe what you sell..."
                    value={formData.shopDescription} onChange={handleChange} disabled={loading}
                    style={{ minHeight: '80px', resize: 'vertical', width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
                </div>
                <div className="form-group">
                  <label htmlFor="shopLocation">Shop Location</label>
                  <input id="shopLocation" type="text" name="shopLocation" placeholder="City, State"
                    value={formData.shopLocation} onChange={handleChange} disabled={loading} />
                </div>
              </>
            )}

            {formData.role === 'mechanic' && (
              <>
                <div className="form-group">
                  <label htmlFor="specialization">Specialization <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="specialization" type="text" name="specialization" placeholder="e.g. Engine Repair, Electrical, Full Service"
                    value={formData.specialization} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="experienceYears">Years of Experience</label>
                  <input id="experienceYears" type="number" name="experienceYears" placeholder="e.g. 5"
                    value={formData.experienceYears} onChange={handleChange} disabled={loading} min="0" max="50" />
                </div>
                <div className="form-group">
                  <label htmlFor="workshopName">Workshop Name</label>
                  <input id="workshopName" type="text" name="workshopName" placeholder="e.g. Quick Fix Garage"
                    value={formData.workshopName} onChange={handleChange} disabled={loading} />
                </div>
                <div className="form-group">
                  <label htmlFor="workshopLocation">Workshop Location</label>
                  <input id="workshopLocation" type="text" name="workshopLocation" placeholder="City, State"
                    value={formData.workshopLocation} onChange={handleChange} disabled={loading} />
                </div>
              </>
            )}

            <div style={{ padding: '12px 16px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D', marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', color: '#92400E', margin: 0 }}>
                <strong>Note:</strong> {formData.role === 'seller' ? 'Seller' : 'Mechanic'} accounts require admin approval before you can start using the platform. You'll be notified once approved.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={prevStep} style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? (
                  <><span className="btn-spinner"></span> Submitting...</>
                ) : (
                  `Submit ${ROLE_INFO[formData.role].title} Application`
                )}
              </button>
            </div>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div>
            {/* Email display */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', backgroundColor: '#F3F4F6', borderRadius: '24px',
                fontSize: '14px', color: '#4B5563'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {formData.email}
              </div>
            </div>

            {otpError && <div className="error-message">{otpError}</div>}

            {/* OTP Input */}
            <div style={{ 
              display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' 
            }}>
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  disabled={loading}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: "'Courier New', monospace",
                    border: digit ? '2px solid #4F46E5' : '2px solid #D1D5DB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: loading ? '#F9FAFB' : '#FFFFFF',
                    color: '#1F2937'
                  }}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleVerifyOTP}
              disabled={loading || otpValues.join('').length !== 6}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {loading ? (
                <><span className="btn-spinner"></span> Verifying...</>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend OTP */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px' }}>
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || resendCooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#9CA3AF' : '#4F46E5',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  padding: '4px 8px'
                }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
