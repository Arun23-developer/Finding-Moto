import { Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser, UserRole } from '../models/User';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dns from 'dns';
import { promisify } from 'util';
import config from '../config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AuthRequest } from '../middleware/auth';
import { generateOTP, sendOTPEmail, sendWelcomeEmail, sendApprovalEmail } from '../utils/email';

const resolveMx = promisify(dns.resolveMx);

interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

interface RegisterRequestBody {
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

interface LoginRequestBody {
  email: string;
  password: string;
}

interface GoogleAuthRequestBody {
  credential: string;
}

interface UserResponse {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  role: UserRole;
  approvalStatus: string;
  isActive: boolean;
  shopName?: string;
  shopDescription?: string;
  shopLocation?: string;
  specialization?: string;
  experienceYears?: number;
  workshopLocation?: string;
  workshopName?: string;
}

interface AuthResponse {
  user: UserResponse;
  token: string;
}

// Validate email format and domain MX records
const validateEmail = async (email: string): Promise<EmailValidationResult> => {
  // Strict format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  // Check domain has MX records (can actually receive email)
  // If DNS is unavailable, allow the email through (soft check)
  const domain = email.split('@')[1];
  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'Email domain cannot receive emails' };
    }
  } catch (err: any) {
    // Only reject if domain definitively doesn't exist (ENOTFOUND)
    // Allow through on network errors (ECONNREFUSED, ETIMEOUT, etc.)
    if (err?.code === 'ENOTFOUND') {
      return { valid: false, reason: 'Email domain does not exist' };
    }
    // DNS unavailable — skip MX check, allow registration
    console.warn(`DNS MX lookup skipped for ${domain}: ${err?.code || err?.message}`);
  }

  return { valid: true };
};

const googleClient = new OAuth2Client(config.googleClientId);

// Generate JWT Token
const generateToken = (id: mongoose.Types.ObjectId, role: string): string => {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as any };
  return jwt.sign({ id: id.toString(), role }, secret, options);
};

// Format user response
const formatUser = (user: IUser): UserResponse => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  approvalStatus: user.approvalStatus,
  isActive: user.isActive,
  shopName: user.shopName,
  shopDescription: user.shopDescription,
  shopLocation: user.shopLocation,
  specialization: user.specialization,
  experienceYears: user.experienceYears,
  workshopLocation: user.workshopLocation,
  workshopName: user.workshopName
});

// @desc    Register new user (buyer, seller, or mechanic)
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      firstName, lastName, email, password, phone, role,
      shopName, shopDescription, shopLocation,
      specialization, experienceYears, workshopLocation, workshopName
    } = req.body as RegisterRequestBody;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'Please fill in all required fields' });
      return;
    }

    // Validate role
    const validRoles: UserRole[] = ['buyer', 'seller', 'mechanic'];
    const userRole = role || 'buyer';
    if (!validRoles.includes(userRole)) {
      res.status(400).json({ message: 'Invalid role. Must be buyer, seller, or mechanic' });
      return;
    }

    // Validate role-specific required fields
    if (userRole === 'seller' && !shopName) {
      res.status(400).json({ message: 'Shop name is required for sellers' });
      return;
    }
    if (userRole === 'mechanic' && !specialization) {
      res.status(400).json({ message: 'Specialization is required for mechanics' });
      return;
    }

    // Validate email format and domain
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      res.status(400).json({ message: emailCheck.reason });
      return;
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Build user data
    const userData: any = {
      firstName, lastName, email, password, phone, role: userRole
    };

    // Add seller-specific fields
    if (userRole === 'seller') {
      userData.shopName = shopName;
      userData.shopDescription = shopDescription;
      userData.shopLocation = shopLocation;
    }

    // Add mechanic-specific fields
    if (userRole === 'mechanic') {
      userData.specialization = specialization;
      userData.experienceYears = experienceYears;
      userData.workshopLocation = workshopLocation;
      userData.workshopName = workshopName;
    }

    // Create user
    const user = await User.create(userData);

    // Generate and save OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.isEmailVerified = false;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, firstName);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail registration, user can resend OTP
    }

    // Return response - no token until email is verified
    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      requiresVerification: true,
      email: user.email,
      role: user.role
    });
  } catch (error: any) {
    // Handle MongoDB duplicate key error (race condition on rapid clicks)
    if (error?.code === 11000) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Registration error:', errorMessage);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequestBody;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    // If user registered with Google only
    if (!user.password) {
      res.status(401).json({ message: 'This account uses Google sign-in. Please use Google to log in.' });
      return;
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Resend OTP automatically
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try {
        await sendOTPEmail(user.email, otp, user.firstName);
      } catch (emailError) {
        console.error('Failed to resend OTP:', emailError);
      }
      res.status(403).json({
        message: 'Email not verified. A new verification code has been sent to your email.',
        requiresVerification: true,
        email: user.email
      });
      return;
    }

    // Check if user can login (approval check for sellers/mechanics)
    if (!user.canLogin()) {
      res.status(403).json({
        message: user.getApprovalMessage(),
        approvalStatus: user.approvalStatus,
        role: user.role
      });
      return;
    }

    res.json({
      user: formatUser(user),
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Google Authentication (buyers only)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { credential } = req.body as GoogleAuthRequestBody;

    if (!credential) {
      res.status(400).json({ message: 'Google credential is required' });
      return;
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId
    });

    const payload = ticket.getPayload() as TokenPayload;
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    if (!email) {
      res.status(400).json({ message: 'Email not provided by Google' });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID and avatar if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();

      // Check if user can login
      if (!user.canLogin()) {
        res.status(403).json({
          message: user.getApprovalMessage(),
          approvalStatus: user.approvalStatus,
          role: user.role
        });
        return;
      }
    } else {
      // Create new user as buyer (Google OAuth = buyer only)
      user = await User.create({
        firstName: given_name || 'User',
        lastName: family_name || '',
        email,
        googleId,
        avatar: picture,
        role: 'buyer'
      });
    }

    res.json({
      user: formatUser(user),
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// @desc    Verify OTP for email verification
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified' });
      return;
    }

    // Check OTP
    if (!user.otp || user.otp !== otp) {
      res.status(400).json({ message: 'Invalid verification code' });
      return;
    }

    // Check OTP expiration
    if (!user.otpExpires || user.otpExpires < new Date()) {
      res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
      return;
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName, user.role);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // If buyer (auto-approved), return token
    // If seller/mechanic (needs approval), return message
    const responseData: any = {
      message: user.getApprovalMessage(),
      user: formatUser(user),
      verified: true
    };

    if (user.canLogin()) {
      responseData.token = generateToken(user._id, user.role);
    }

    res.json(responseData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Resend OTP verification code
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified' });
      return;
    }

    // Rate limiting: don't allow resend if OTP was sent less than 60 seconds ago
    if (user.otpExpires) {
      const otpCreatedAt = new Date(user.otpExpires.getTime() - 10 * 60 * 1000);
      const timeSince = Date.now() - otpCreatedAt.getTime();
      if (timeSince < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeSince) / 1000);
        res.status(429).json({ message: `Please wait ${waitSeconds} seconds before requesting a new code.` });
        return;
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.firstName);

    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(formatUser(user));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Fields that can be updated by the user
    const { firstName, lastName, phone, address, avatar } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    // Role-specific fields
    if (user.role === 'seller') {
      const { shopName, shopDescription, shopLocation } = req.body;
      if (shopName) user.shopName = shopName;
      if (shopDescription !== undefined) user.shopDescription = shopDescription;
      if (shopLocation !== undefined) user.shopLocation = shopLocation;
    }

    if (user.role === 'mechanic') {
      const { specialization, experienceYears, workshopLocation, workshopName } = req.body;
      if (specialization) user.specialization = specialization;
      if (experienceYears !== undefined) user.experienceYears = experienceYears;
      if (workshopLocation !== undefined) user.workshopLocation = workshopLocation;
      if (workshopName !== undefined) user.workshopName = workshopName;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: formatUser(user)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Check approval status
// @route   GET /api/auth/approval-status
// @access  Public (by email query param)
export const checkApprovalStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      role: user.role,
      approvalStatus: user.approvalStatus,
      canLogin: user.canLogin(),
      message: user.getApprovalMessage()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// ========== ADMIN ENDPOINTS ==========

// @desc    Get all pending approvals
// @route   GET /api/auth/admin/pending
// @access  Private/Admin
export const getPendingApprovals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const roleFilter = req.query.role as string;
    
    const filter: any = { approvalStatus: 'pending' };
    if (roleFilter && ['seller', 'mechanic'].includes(roleFilter)) {
      filter.role = roleFilter;
    } else {
      filter.role = { $in: ['seller', 'mechanic'] };
    }

    const users = await User.find(filter).sort({ createdAt: 1 });

    res.json({
      users: users.map(formatUser),
      count: users.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Approve or reject a user
// @route   PUT /api/auth/admin/approve/:userId
// @access  Private/Admin
export const approveUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: 'Action must be "approve" or "reject"' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!['seller', 'mechanic'].includes(user.role)) {
      res.status(400).json({ message: 'Only seller and mechanic accounts can be approved/rejected' });
      return;
    }

    if (action === 'approve') {
      user.approvalStatus = 'approved';
      user.approvalNotes = notes || 'Approved by admin';
      user.approvedAt = new Date();
    } else {
      user.approvalStatus = 'rejected';
      user.approvalNotes = notes || 'Rejected by admin';
    }

    await user.save();

    // Send approval/rejection notification email
    try {
      await sendApprovalEmail(
        user.email,
        user.firstName,
        action === 'approve',
        user.approvalNotes || undefined
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({
      message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: formatUser(user)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Get all users (admin management)
// @route   GET /api/auth/admin/users
// @access  Private/Admin
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, status, search } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.approvalStatus = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      users: users.map(formatUser),
      count: users.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/auth/admin/toggle-active/:userId
// @access  Private/Admin
export const toggleUserActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: formatUser(user)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};
