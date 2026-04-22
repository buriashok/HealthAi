import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Clock, User, Stethoscope, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DOCTORS = [
  { name: 'Dr. Priya Sharma', specialty: 'General Medicine', available: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { name: 'Dr. Rajesh Kumar', specialty: 'Cardiology', available: ['09:30', '11:00', '13:00', '15:30'] },
  { name: 'Dr. Aisha Patel', specialty: 'Dermatology', available: ['10:00', '11:30', '14:00', '16:00'] },
  { name: 'Dr. Vikram Singh', specialty: 'Orthopedics', available: ['08:30', '10:30', '13:00', '15:00'] },
  { name: 'Dr. Meera Reddy', specialty: 'Pediatrics', available: ['09:00', '11:00', '14:30', '16:00'] },
  { name: 'Dr. Sanjay Gupta', specialty: 'ENT', available: ['10:00', '12:00', '14:00', '16:30'] },
];

const AppointmentBooking = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    doctorName: '', specialty: '', date: '', timeSlot: '', notes: '',
  });

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchAppointments(); }, [token]);

  const handleDoctorSelect = (doctor) => {
    setForm({ ...form, doctorName: doctor.name, specialty: doctor.specialty });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(prev => [data.appointment, ...prev]);
        setShowForm(false);
        setForm({ doctorName: '', specialty: '', date: '', timeSlot: '', notes: '' });
        setSuccess('Appointment booked successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    try {
      await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
    } catch { /* ignore */ }
  };

  const selectedDoctor = DOCTORS.find(d => d.name === form.doctorName);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Book and manage your doctor appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Book Appointment</>}
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'rgba(57,211,83,0.1)', border: '1px solid rgba(57,211,83,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> {success}
        </motion.div>
      )}

      {/* Booking Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <h3 style={{ fontWeight: 700 }}>Book New Appointment</h3>

              {/* Doctor Selection */}
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                  <Stethoscope size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Select Doctor
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {DOCTORS.map((doc) => (
                    <button type="button" key={doc.name} onClick={() => handleDoctorSelect(doc)}
                      style={{
                        padding: '12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
                        background: form.doctorName === doc.name ? 'var(--primary-light)' : 'var(--surface-hover)',
                        border: `1px solid ${form.doctorName === doc.name ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                        color: 'var(--text-primary)', fontFamily: 'var(--font-family)',
                      }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{doc.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{doc.specialty}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label><CalendarDays size={14} /> Date</label>
                  <input className="input-field" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="input-group">
                  <label><Clock size={14} /> Time Slot</label>
                  <select className="input-field" value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} required
                    style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }}>
                    <option value="">Select time</option>
                    {(selectedDoctor?.available || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Notes (optional)</label>
                <input className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any specific concerns..." />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving || !form.doctorName || !form.date || !form.timeSlot}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Booking'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointments List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary-color)" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
          <CalendarDays size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>No appointments booked yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {appointments.map((appt) => (
            <div key={appt._id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-color)', flexShrink: 0 }}>
                <User size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{appt.doctorName}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {appt.specialty} • {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                </div>
              </div>
              <span className={`badge ${appt.status === 'scheduled' ? 'badge-green' : appt.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                {appt.status}
              </span>
              {appt.status === 'scheduled' && (
                <button onClick={() => handleCancel(appt._id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-color)' }}>
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentBooking;
