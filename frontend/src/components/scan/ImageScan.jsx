import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ImageScan = () => {
  const { addHistoryRecord } = useAppContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate CNN processing
    setTimeout(() => {
      setIsScanning(false);
      const res = {
        condition: "Benign Nevus (Mole)",
        confidence: 94.2,
        recommendation: "Routine monitoring is recommended. No immediate concern detected."
      };
      setScanResult(res);
      addHistoryRecord({ type: 'scan', date: new Date().toISOString(), details: res });
    }, 2500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h2 className="page-title">Image-Based Disease Detection</h2>
        <p className="page-subtitle">Upload an image of a skin condition or affected area for AI analysis.</p>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px' }}>
        
        {!selectedImage ? (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '2px dashed var(--surface-border)', padding: '40px', borderRadius: '16px', width: '100%', cursor: 'pointer', transition: 'all 0.3s' }}>
            <Upload size={48} color="var(--primary-color)" />
            <span style={{ fontSize: '1.2rem' }}>Click or drag image to upload</span>
            <span style={{ color: 'var(--text-secondary)' }}>Supports JPG, PNG</span>
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
          </label>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
             <div style={{ position: 'relative', width: '300px', height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                <img src={selectedImage} alt="Uploaded condition" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isScanning && (
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <Loader2 size={48} color="var(--primary-color)" className="animate-spin" />
                      <span style={{ color: 'white', fontWeight: 'bold' }}>Running CNN Models...</span>
                   </div>
                )}
             </div>
             
             {!scanResult && !isScanning && (
               <div style={{ display: 'flex', gap: '16px' }}>
                 <button className="btn btn-secondary" onClick={() => setSelectedImage(null)}>Change Image</button>
                 <button className="btn" onClick={handleScan}><ImageIcon size={18}/> Analyze Image</button>
               </div>
             )}
          </div>
        )}

      </div>

      {scanResult && (
         <div className="animate-fade-in glass-panel" style={{ borderLeft: '4px solid var(--accent-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
               <CheckCircle size={28} color="var(--accent-color)" />
               <h3 style={{ margin: 0 }}>Analysis Complete</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Detected Condition</span>
                  <span style={{ fontWeight: 'bold' }}>{scanResult.condition}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>AI Confidence</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{scanResult.confidence}%</span>
               </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <AlertTriangle size={20} color="var(--warning-color)" style={{ flexShrink: 0 }} />
               <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                 {scanResult.recommendation} <br/><br/>
                 <em>Please remember, this AI model is trained on standard datasets and does not replace a professional dermatological/medical evaluation.</em>
               </p>
            </div>
         </div>
      )}

    </div>
  );
};

export default ImageScan;
