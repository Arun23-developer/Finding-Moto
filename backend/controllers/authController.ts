import { Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dns from 'dns';
import { promisify } from 'util';
import config from '../config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AuthRequest } from '../middleware/auth';

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
  avatar?: string | null;
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
  const domain = email.split('@')[1];
  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'Email domain cannot receive emails' };
    }
  } catch (err) {
    return { valid: false, reason: 'Email domain does not exist' };
  }

  return { valid: true };
};

const googleClient = new OAuth2Client(config.googleClientId);

// Generate JWT Token
const generateToken = (id: mongoose.Types.ObjectId): string => {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as any };
  return jwt.sign({ id: id.toString() }, secret, options);
};

// Format user response
const formatUser = (user: IUser): UserResponse => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  avatar: user.avatar
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body as RegisterRequestBody;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'Please fill in all fields' });
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

    // Create user
    const user = await User.create({ firstName, lastName, email, password });

    res.status(201).json({
      user: formatUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
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

    res.json({
      user: formatUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: errorMessage });
  }
};

// @desc    Google Authentication
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
    } else {
      // Create new user
      user = await User.create({
        firstName: given_name || 'User',
        lastName: family_name || '',
        email,
        googleId,
        avatar: picture
      });
    }

    res.json({
      user: formatUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
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
