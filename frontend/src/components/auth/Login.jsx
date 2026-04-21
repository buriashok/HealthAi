import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard'); // Go to dashboard after login
    } catch (err) {
      console.error('Login Failed', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.1), transparent 40%)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel" 
        style={{ 
          maxWidth: '420px', 
          width: '100%', 
          padding: '40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '24px',
          textAlign: 'center'
        }}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            padding: '16px',
            borderRadius: '24px',
            marginBottom: '8px'
          }}
        >
          <Activity size={48} color="white" />
        </motion.div>

        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome to HealthAI
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Your personal, intelligent health companion. Sign in to access your dashboard, save symptom checks, and track your wellness.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.error('Google Login Failed');
            }}
            theme="filled_black"
            size="large"
            shape="pill"
            width="100%"
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={16} color="var(--primary-color)" /> Secure
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HeartPulse size={16} color="var(--danger-color)" /> Private
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
