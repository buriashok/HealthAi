import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { MessageSquare, Stethoscope, CalendarDays, Pill, AlertTriangle, BarChart3, ShieldCheck, Bot, HeartPulse, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { user } = useAuth();
  const { healthHistory, reminders } = useAppContext();

  const firstName = user?.name?.split(' ')[0] || 'User';
  const pendingReminders = reminders.filter(r => r.status === 'Pending' || (r.active !== false)).length;

  const quickActions = [
    { icon: <MessageSquare size={22} />, label: 'AI Chat', desc: 'Ask anything about health', path: '/chat', color: 'var(--primary-color)' },
    { icon: <Stethoscope size={22} />, label: 'Symptom Check', desc: 'Step-by-step diagnosis', path: '/symptoms', color: 'var(--secondary-color)' },
    { icon: <CalendarDays size={22} />, label: 'Appointments', desc: 'Book a doctor visit', path: '/appointments', color: 'var(--info-color)' },
    { icon: <AlertTriangle size={22} />, label: 'Emergency', desc: 'Get instant advice', path: '/emergency', color: 'var(--danger-color)' },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

      {/* Welcome Header */}
      <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)' }}>
            Welcome back, <span style={{ color: 'var(--primary-color)' }}>{firstName}</span> 👋
          </h1>
          <p className="page-subtitle" style={{ marginTop: 'var(--space-sm)' }}>
            Your AI health companion is ready to help. What would you like to do today?
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="trust-badge green"><ShieldCheck size={14} /> Encrypted</span>
          <span className="trust-badge blue"><Bot size={14} /> AI-Powered</span>
          <span className="trust-badge purple"><HeartPulse size={14} /> Medical-Grade</span>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={item} className="disclaimer-banner">
        <AlertTriangle size={16} />
        <span>This is not a medical diagnosis. Always consult a healthcare professional for medical advice.</span>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={item}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
          {quickActions.map((action) => (
            <Link key={action.path} to={action.path} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="stat-card"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                  background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: action.color, flexShrink: 0,
                }}>
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{action.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{action.desc}</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--primary-color)', marginBottom: '8px' }}><Activity size={28} /></div>
          <div className="stat-value" style={{ color: 'var(--primary-color)' }}>{user?.gamification?.points || 0}</div>
          <div className="stat-label">Health Points</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--secondary-color)', marginBottom: '8px' }}><BarChart3 size={28} /></div>
          <div className="stat-value" style={{ color: 'var(--secondary-color)' }}>{healthHistory.length}</div>
          <div className="stat-label">Check-ups Done</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--warning-color)', marginBottom: '8px' }}><Pill size={28} /></div>
          <div className="stat-value" style={{ color: 'var(--warning-color)' }}>{pendingReminders}</div>
          <div className="stat-label">Active Reminders</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-color)', marginBottom: '8px' }}><Sparkles size={28} /></div>
          <div className="stat-value" style={{ color: 'var(--accent-color)' }}>Lvl {user?.gamification?.level || 1}</div>
          <div className="stat-label">Health Rank</div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="glass-panel">
        <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>Recent Activity</h3>
        {healthHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No activity yet. Start a chat or check your symptoms to see your history here!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {healthHistory.slice(0, 5).map((entry, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: idx < 4 ? '1px solid var(--surface-border)' : 'none',
                fontSize: 'var(--text-sm)',
              }}>
                <span>{entry.type === 'chat' ? '💬 Symptom Chat' : '🔬 Image Scan'}</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(entry.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
