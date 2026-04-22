import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendOTP, sendPasswordReset } from '../services/emailService.js';

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── POST /api/auth/register ─────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If exists but not verified, update and resend OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const hashedOtp = await bcrypt.hash(otp, 10);

    let user;
    if (existing && !existing.isVerified) {
      existing.name = name;
      existing.password = password;
      existing.otp = hashedOtp;
      existing.otpExpires = otpExpires;
      await existing.save();
      user = existing;
    } else {
      user = await User.create({
        name,
        email,
        password,
        otp: hashedOtp,
        otpExpires,
        isVerified: false,
      });
    }

    // Send OTP email
    try {
      await sendOTP(email, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Still return success — user can request resend
    }

    res.status(201).json({
      message: 'Registration successful. Check your email for the verification code.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─── POST /api/auth/verify-otp ───────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.json({ message: 'Already verified' });

    if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) return res.status(400).json({ error: 'Invalid OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Auto-login after verification
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken });
    user.cleanExpiredTokens();
    await user.save();

    res.json({
      message: 'Email verified successfully',
      token: accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, gamification: user.gamification, settings: user.settings },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// ─── POST /api/auth/resend-otp ───────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.json({ message: 'Already verified' });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.otp = hashedOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTP(email, otp);
    } catch (emailErr) {
      console.error('Email resend failed:', emailErr.message);
    }

    res.json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.', needsVerification: true });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    user.cleanExpiredTokens();
    user.lastActive = Date.now();
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, gamification: user.gamification, settings: user.settings },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ─── POST /api/auth/google ───────────────────────────────────────
export { default as googleAuth } from './googleAuthHandler.js';

// ─── POST /api/auth/refresh ──────────────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;
    if (!incomingToken) return res.status(400).json({ error: 'Refresh token required' });

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Check if refresh token exists in user's token list
    const tokenExists = user.refreshTokens.some(rt => rt.token === incomingToken);
    if (!tokenExists) return res.status(401).json({ error: 'Refresh token revoked' });

    // Rotate: remove old, create new
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== incomingToken);
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: newRefreshToken });
    user.cleanExpiredTokens();
    
    // Use updateOne to bypass VersionError during concurrent requests
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshTokens: user.refreshTokens } }
    );

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Don't reveal if user exists or not
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetToken = hashedToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;

    try {
      await sendPasswordReset(email, resetLink);
    } catch (emailErr) {
      console.error('Reset email send failed:', emailErr.message);
    }

    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// ─── POST /api/auth/reset-password ───────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+resetToken +resetTokenExpires');
    if (!user || !user.resetToken || !user.resetTokenExpires) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    if (user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    const isValid = await bcrypt.compare(token, user.resetToken);
    if (!isValid) return res.status(400).json({ error: 'Invalid reset token' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.isVerified = true; // Ensure verified after reset
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── POST /api/auth/logout ──────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const { refreshToken: tokenToRevoke } = req.body;
    if (tokenToRevoke && req.user) {
      const user = await User.findById(req.user.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== tokenToRevoke);
        await user.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
