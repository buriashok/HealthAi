import React, { useState } from 'react';
import { Users, Activity, Database, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [diseases, setDiseases] = useState([
    { id: 1, name: 'Viral Flu', keywords: 'fever, cough', threshold: '70%' },
    { id: 2, name: 'COVID-19', keywords: 'fever, loss of taste, dry cough', threshold: '80%' },
    { id: 3, name: 'Muscle Strain', keywords: 'pain, back, lifting', threshold: '60%' },
  ]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="page-subtitle">Manage system analytics, triage rules, and disease database.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary-color)' }}>
               <Users size={24} /> <h3>Total Users</h3>
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,248</span>
            <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>+12% this week</span>
         </div>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-color)' }}>
               <Activity size={24} /> <h3>Assessments</h3>
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>8,432</span>
            <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>+5% this week</span>
         </div>
         <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--warning-color)' }}>
               <AlertTriangle size={24} /> <h3>Active Alerts</h3>
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Needs review</span>
         </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Database size={24} color="var(--primary-color)" />
               <h3 style={{ margin: 0 }}>Disease & Triage Rules Database</h3>
            </div>
            <button className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Add Rule</button>
         </div>

         <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                     <th style={{ padding: '12px' }}>ID</th>
                     <th style={{ padding: '12px' }}>Condition Name</th>
                     <th style={{ padding: '12px' }}>Trigger Keywords</th>
                     <th style={{ padding: '12px' }}>Confidence Thresh.</th>
                     <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {diseases.map(d => (
                     <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px' }}>#{d.id}</td>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{d.name}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{d.keywords}</td>
                        <td style={{ padding: '12px' }}>
                           <span style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--primary-color)' }}>{d.threshold}</span>
                        </td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                           <button className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }}><Edit3 size={16}/></button>
                           <button className="btn-secondary" style={{ padding: '6px', borderRadius: '6px', color: 'var(--danger-color)' }}><Trash2 size={16}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;
