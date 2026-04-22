import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, HeartPulse, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { loginWithGoogle, loginWithEmail, register, verifyOTP, resendOTP } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'otp' | 'forgot'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(formData.email, formData.password);
    } catch (err) {
      if (err.message.includes('not verified')) {
        setMode('otp');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password);
      setMode('otp');
      setSuccess('Verification code sent to your email!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOTP(formData.email, otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await resendOTP(formData.email);
      setSuccess('New code sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { forgotPassword: forgot } = useAuth;
      // Direct API call for simplicity
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      setSuccess(data.message || 'If an account exists, a reset link has been sent.');
    } catch (err) {
      setError('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-color)',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 20% 20%, rgba(27, 169, 76, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.06) 0%, transparent 50%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{
          maxWidth: '440px', width: '100%', padding: '40px',
          display: 'flex', flexDirection: 'column', gap: '24px',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Activity size={32} color="white" />
          </motion.div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '4px' }}>
            HealthAI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Your intelligent health companion
          </p>
        </div>

        {/* Mode Tabs — only show for signin/signup */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="tabs" style={{ justifyContent: 'center' }}>
            <button className={`tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => { setMode('signin'); setError(''); }}>
              Sign In
            </button>
            <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>
              Sign Up
            </button>
          </div>
        )}

        {/* Error / Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(240,68,56,0.1)', border: '1px solid rgba(240,68,56,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)', color: 'var(--danger-color)' }}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(57,211,83,0.1)', border: '1px solid rgba(57,211,83,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 'var(--text-sm)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Sign In Form ─────────────────────────────────── */}
        {mode === 'signin' && (
          <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label><Mail size={14} /> Email</label>
              <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="input-group">
              <label><Lock size={14} /> Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'right', fontFamily: 'var(--font-family)', fontWeight: 600 }}>
              Forgot Password?
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Sign In</>}
            </button>
          </form>
        )}

        {/* ─── Sign Up Form ─────────────────────────────────── */}
        {mode === 'signup' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label><User size={14} /> Full Name</label>
              <input className="input-field" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required minLength={2} />
            </div>
            <div className="input-group">
              <label><Mail size={14} /> Email</label>
              <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="input-group">
              <label><Lock size={14} /> Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min 8 chars, 1 upper, 1 number" required minLength={8} style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Create Account</>}
            </button>
          </form>
        )}

        {/* ─── OTP Verification ─────────────────────────────── */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Verify Your Email</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Enter the 6-digit code sent to <strong>{formData.email}</strong>
            </p>
            <input
              className="input-field"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', letterSpacing: '8px', fontWeight: 700 }}
              required
            />
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || otp.length !== 6} style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify'}
            </button>
            <button type="button" onClick={handleResendOTP} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              Resend Code
            </button>
            <button type="button" onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ─── Forgot Password ──────────────────────────────── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Reset Password</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <div className="input-group">
              <label><Mail size={14} /> Email</label>
              <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => { setMode('signin'); setSuccess(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)' }}>
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* ─── Google OAuth Divider ─────────────────────────── */}
        {(mode === 'signin' || mode === 'signup') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                theme="filled_black"
                size="large"
                shape="pill"
                text={mode === 'signup' ? 'signup_with' : 'signin_with'}
              />
            </div>
          </>
        )}

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="trust-badge green"><ShieldCheck size={14} /> Secure</span>
          <span className="trust-badge blue"><HeartPulse size={14} /> HIPAA-Aware</span>
          <span className="trust-badge purple"><Activity size={14} /> AI-Powered</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
