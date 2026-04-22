import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  register, verifyOTP, resendOTP, login,
  refreshToken, forgotPassword, resetPassword,
  getMe, logout,
} from '../controllers/authController.js';
import googleAuth from '../controllers/googleAuthHandler.js';

const router = express.Router();

// Public routes
router.post('/register', validate('register'), register);
router.post('/verify-otp', validate('verifyOtp'), verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', validate('login'), login);
router.post('/google', googleAuth);
router.post('/refresh', refreshToken);
router.post('/forgot-password', validate('forgotPassword'), forgotPassword);
router.post('/reset-password', validate('resetPassword'), resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', optionalAuth, logout);

export default router;
