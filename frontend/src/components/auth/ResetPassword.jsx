import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extract token and email from URL
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';
  const pathParts = window.location.pathname.split('/');
  const token = pathParts[pathParts.length - 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg-color)',
    }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel"
        style={{ maxWidth: '440px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Activity size={28} color="white" />
          </div>
        </div>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 size={48} color="var(--accent-color)" />
            <h2 style={{ fontSize: 'var(--text-xl)' }}>Password Reset Successful!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You can now sign in with your new password.</p>
            <a href="/" className="btn btn-primary btn-lg">Go to Sign In</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Set New Password</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Create a strong password for <strong>{email}</strong>
            </p>

            {error && (
              <div style={{ background: 'rgba(240,68,56,0.1)', border: '1px solid rgba(240,68,56,0.3)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: 'var(--text-sm)', color: 'var(--danger-color)' }}>
                {error}
              </div>
            )}

            <div className="input-group">
              <label><Lock size={14} /> New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, 1 upper, 1 number" required minLength={8} style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label><Lock size={14} /> Confirm Password</label>
              <input className="input-field" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
