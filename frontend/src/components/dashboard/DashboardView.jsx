import React, { useMemo } from 'react';
import { ShieldAlert, Heart, Activity as ActivityIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DashboardView = () => {
  const { userProfile, healthHistory } = useAppContext();

  // Compute stats based on real history
  const riskLevel = useMemo(() => {
    if (healthHistory.length === 0) return 'Low';
    
    // Simple heuristic: if recent history has high probability conditions
    const recent = healthHistory[0];
    if (recent.type === 'scan' && recent.details.confidence < 50) return 'Medium';
    if (recent.type === 'chat' && recent.details.predictions[0]?.probability > 70) return 'High';
    if (recent.type === 'chat' && recent.details.predictions[0]?.probability > 40) return 'Medium';
    
    return 'Low';
  }, [healthHistory]);

  const riskColor = riskLevel === 'High' ? 'var(--danger-color)' : riskLevel === 'Medium' ? 'var(--warning-color)' : 'var(--accent-color)';

  const wellnessScore = Math.min(100, 50 + (userProfile.streak * 5) - (riskLevel === 'High' ? 30 : riskLevel === 'Medium' ? 15 : 0));

  // Compute chart heights dynamically based on past 6 interactions
  const chartData = useMemo(() => {
    const defaultChart = [10, 10, 10, 10, 10, 10]; // Minimum baseline
    healthHistory.slice(0, 6).reverse().forEach((record, index) => {
       if(record.type === 'chat') defaultChart[index] = Math.max(10, record.details.predictions[0]?.probability || 10);
       if(record.type === 'scan') defaultChart[index] = Math.max(10, 100 - record.details.confidence);
    });
    return defaultChart;
  }, [healthHistory]);


  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="page-title">Health Risk Prediction Dashboard</h2>
        <p className="page-subtitle">Monitoring your health trends based on your live interactions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        {/* Risk Level Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <ShieldAlert size={28} color={riskColor} />
             <h3 style={{ margin: 0 }}>Current Risk Level</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: riskColor }}>
            {riskLevel}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Computed from your most recent symptomatic interactions.
          </p>
        </div>

        {/* Vital Stats Mock */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Heart size={28} color="var(--danger-color)" />
             <h3 style={{ margin: 0 }}>Wellness Score</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
            {wellnessScore}/100
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <div style={{ width: `${wellnessScore}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '4px', transition: 'width 1s ease' }}></div>
          </div>
        </div>

        {/* Activity Status */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <ActivityIcon size={28} color="var(--primary-color)" />
             <h3 style={{ margin: 0 }}>Recent Activity</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            {healthHistory.slice(0, 3).map((hist, idx) => (
               <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span>{hist.type === 'chat' ? 'Symptom Logged' : 'Image Scanned'}</span>
                 <span style={{ color: 'var(--text-secondary)' }}>{new Date(hist.date).toLocaleDateString()}</span>
               </li>
            ))}
            {healthHistory.length === 0 && <span style={{color: 'var(--text-secondary)'}}>No recent activity.</span>}
          </ul>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '12px' }}>
        <h3>Computed Baseline History</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '24px' }}>
           {chartData.map((height, i) => (
             <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
               <div style={{ 
                 width: '100%', 
                 height: `${height}%`, 
                 background: `linear-gradient(to top, var(--primary-color), var(--primary-hover))`,
                 borderRadius: '4px 4px 0 0',
                 transition: 'height 1s ease'
               }}></div>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>E{i+1}</span>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
