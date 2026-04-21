import React, { useState } from 'react';
import { Bell, Clock, Calendar, Check, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const SmartAlerts = () => {
  const { reminders, addReminder, completeReminder, deleteReminder } = useAppContext();
  
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  const [alerts] = useState([
    { id: 1, message: 'High risk of seasonal flu in your area.', level: 'High' },
    { id: 2, message: 'Air quality is poor today, wear a mask outside.', level: 'Medium' },
  ]);

  const handleAdd = () => {
    if (newTitle && newTime) {
      addReminder({ title: newTitle, time: newTime, type: 'Custom' });
      setNewTitle('');
      setNewTime('');
      setShowAdd(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="page-title">Smart Alerts & Reminders</h2>
        <p className="page-subtitle">Manage your medicine schedules and receive seasonal health warnings.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Health Alerts */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>Health Warnings</h3>
           {alerts.map(alert => (
             <div key={alert.id} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', borderLeft: `4px solid ${alert.level === 'High' ? 'var(--danger-color)' : 'var(--warning-color)'}` }}>
                <AlertCircle color={alert.level === 'High' ? 'var(--danger-color)' : 'var(--warning-color)'} />
                <div>
                   <span style={{ fontWeight: 'bold' }}>{alert.level} Alert</span>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{alert.message}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Reminders list */}
        <div className="glass-panel" style={{ flex: '2 1 400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Daily Schedule</h3>
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => setShowAdd(!showAdd)}>
                <Plus size={16}/> Add Reminder
              </button>
           </div>
           
           {showAdd && (
             <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
               <input type="text" className="input-field" placeholder="Activity (e.g. Drink Water)" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ flex: 2, padding: '8px' }} />
               <input type="time" className="input-field" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ flex: 1, padding: '8px' }} />
               <button className="btn btn-accent" onClick={handleAdd}>Save</button>
             </div>
           )}

           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reminders.length === 0 && <span style={{color: 'var(--text-secondary)'}}>No active reminders.</span>}
              {reminders.map(reminder => (
                <div key={reminder.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', borderLeft: reminder.status === 'Completed' ? '4px solid var(--accent-color)' : '4px solid var(--primary-color)' }}>
                   <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }}>
                         {reminder.type === 'Medicine' ? <Clock size={20} /> : <Calendar size={20} />}
                      </div>
                      <div>
                         <h4 style={{ margin: 0, textDecoration: reminder.status === 'Completed' ? 'line-through' : 'none', color: reminder.status === 'Completed' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{reminder.title}</h4>
                         <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reminder.time} • {reminder.type}</span>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', gap: '8px' }}>
                     {reminder.status !== 'Completed' ? (
                        <button className="btn-secondary" style={{ padding: '8px', borderRadius: '50%', border: '1px solid var(--surface-border)' }} onClick={() => completeReminder(reminder.id)}>
                           <Check size={16} />
                        </button>
                     ) : (
                        <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>Done</span>
                     )}
                     <button className="btn-secondary" style={{ padding: '8px', borderRadius: '50%', border: '1px solid transparent', color: 'var(--danger-color)' }} onClick={() => deleteReminder(reminder.id)}>
                         <Trash2 size={16} />
                     </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default SmartAlerts;
