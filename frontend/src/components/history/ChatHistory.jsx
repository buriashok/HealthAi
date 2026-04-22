import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, MessageSquare, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatHistory = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const fetchHistory = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/history?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory(page);
  }, [token, page]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary-color)" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div>
        <h1 className="page-title">Chat History</h1>
        <p className="page-subtitle">Review your past health conversations and analyses</p>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
          <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>No chat history yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Start a conversation with the AI to see your history here.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {sessions.map((session) => (
              <motion.div
                key={session._id}
                whileHover={{ x: 4 }}
                className="glass-panel"
                style={{ cursor: 'pointer', padding: 'var(--space-md) var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}
                onClick={() => setSelectedSession(selectedSession?._id === session._id ? null : session)}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-color)', flexShrink: 0 }}>
                  <MessageSquare size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>{session.title || 'Health Conversation'}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} /> {new Date(session.createdAt).toLocaleString()}
                    {session.messages && <span>• {session.messages.length} messages</span>}
                  </div>
                </div>
                {session.predictions?.length > 0 && (
                  <span className="badge badge-yellow" style={{ flexShrink: 0 }}>
                    {session.predictions.length} conditions
                  </span>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(session._id); }} className="btn btn-ghost" style={{ padding: '6px' }}>
                  <Trash2 size={16} color="var(--danger-color)" />
                </button>
                <ChevronRight size={16} color="var(--text-muted)" style={{ transform: selectedSession?._id === session._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </motion.div>
            ))}
          </div>

          {/* Selected Session Detail */}
          {selectedSession && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel">
              <h3 style={{ marginBottom: 'var(--space-md)' }}>{selectedSession.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {selectedSession.messages?.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      background: msg.role === 'user' ? 'var(--primary-color)' : 'var(--surface-solid)',
                      border: msg.role !== 'user' ? '1px solid var(--surface-border)' : 'none',
                      fontSize: 'var(--text-sm)', lineHeight: '1.6', whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              {selectedSession.predictions?.length > 0 && (
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: 'var(--text-sm)' }}>Predictions</h4>
                  {selectedSession.predictions.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'var(--text-sm)' }}>
                      <span>{p.condition}</span>
                      <span style={{ fontWeight: 700, color: p.color }}>{p.probability}%</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                {page} / {pagination.pages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ChatHistory;
