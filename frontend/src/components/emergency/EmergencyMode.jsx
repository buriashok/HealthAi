import React, { useState, useRef } from 'react';
import { AlertTriangle, Phone, Send, Loader2, MapPin, Upload, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../../utils/symptomEngine';
import { motion } from 'framer-motion';

const EmergencyMode = () => {
  const [symptoms, setSymptoms] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleQuickSymptom = async (symptomText) => {
    setSymptoms(symptomText);
    setLoading(true);
    try {
      const reply = await sendChatMessage([
        { role: 'user', content: `EMERGENCY: ${symptomText}. I need immediate guidance. What should I do right now?` }
      ]);
      setResponse(reply);
    } catch {
      setResponse('Unable to reach AI. If this is a medical emergency, please call 112 immediately.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    await handleQuickSymptom(symptoms);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file.name);
    setLoading(true);
    try {
      const reply = await sendChatMessage([
        { role: 'user', content: `I have uploaded a medical report (${file.name}). Please explain what kind of information is typically found in such a report and what common findings mean. Provide general guidance on understanding medical reports.` }
      ]);
      setResponse(reply);
    } catch {
      setResponse('Unable to analyze the report. Please consult your doctor for a detailed explanation.');
    } finally {
      setLoading(false);
    }
  };

  const quickSymptoms = [
    { label: '🫀 Chest Pain', text: 'Severe chest pain and difficulty breathing' },
    { label: '🧠 Severe Headache', text: 'Sudden severe headache with vision problems' },
    { label: '🤒 High Fever', text: 'Very high fever above 103°F with chills' },
    { label: '🩸 Severe Bleeding', text: 'Severe uncontrolled bleeding' },
    { label: '😵 Fainting', text: 'Sudden fainting or loss of consciousness' },
    { label: '🫁 Can\'t Breathe', text: 'Severe difficulty breathing, shortness of breath' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={32} /> Emergency Mode
        </h1>
        <p className="page-subtitle">Get instant AI guidance for urgent medical situations</p>
      </div>

      {/* Emergency Call Button */}
      <a href="tel:112" className="btn btn-danger btn-lg" style={{ width: 'fit-content', gap: '10px', fontSize: 'var(--text-lg)', padding: '16px 32px' }}>
        <Phone size={22} /> Call Emergency Services — 112
      </a>

      {/* Quick Symptoms */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 700 }}>⚡ Quick Symptom Selection</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
          {quickSymptoms.map((qs) => (
            <button key={qs.label} onClick={() => handleQuickSymptom(qs.text)} disabled={loading}
              className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px' }}>
              {qs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 style={{ fontWeight: 700 }}>Describe Your Emergency</h3>
        <textarea
          className="input-field"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms in detail for faster, more accurate guidance..."
          rows={3}
          style={{ resize: 'vertical', lineHeight: '1.6' }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-danger" disabled={loading || !symptoms.trim()}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Get Instant Advice</>}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            <Upload size={16} /> Upload Report
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} style={{ display: 'none' }} />
        </div>
        {uploadedFile && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>📄 {uploadedFile}</p>}
      </form>

      {/* AI Response */}
      {response && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel"
          style={{ borderColor: 'rgba(240, 68, 56, 0.3)', borderWidth: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-md)' }}>
            <Sparkles size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontWeight: 700 }}>AI Emergency Guidance</h3>
          </div>
          <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
            {response}
          </div>
          <div className="disclaimer-banner" style={{ marginTop: 'var(--space-md)' }}>
            <AlertTriangle size={14} />
            <span>This is AI-generated guidance, not a medical diagnosis. Call 112 for true emergencies.</span>
          </div>
        </motion.div>
      )}

      {/* Nearby Hospitals Link */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <MapPin size={24} color="var(--info-color)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Find Nearest Hospital</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Locate emergency care near you</div>
        </div>
        <a href="/nearby" className="btn btn-secondary btn-sm">View Map →</a>
      </div>
    </motion.div>
  );
};

export default EmergencyMode;
