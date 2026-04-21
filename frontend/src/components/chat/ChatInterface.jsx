import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Loader2, AlertCircle, Sparkles, BarChart3 } from 'lucide-react';
import { sendChatMessage, getTranslation, analyzeSymptoms } from '../../utils/symptomEngine';
import { useAppContext } from '../../context/AppContext';

const ChatInterface = () => {
  const { addHistoryRecord } = useAppContext();
  const [messages, setMessages] = useState([]);         // UI messages: { id, text, sender }
  const [chatHistory, setChatHistory] = useState([]);    // Groq-format: { role, content }
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initial greeting
    const loadGreeting = async () => {
      const greeting = await getTranslation(language, 'greeting');
      setMessages([
        { id: 1, text: greeting, sender: 'bot' },
      ]);
      setChatHistory([]);
      setMessageCount(0);
      setPredictions(null);
    };
    loadGreeting();
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, predictions]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage;
    const newUserMessage = { id: Date.now(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Build conversation history for Groq
    const updatedHistory = [...chatHistory, { role: 'user', content: userText }];
    setChatHistory(updatedHistory);
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    try {
      // Get AI response from Groq
      const aiReply = await sendChatMessage(updatedHistory, language);
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiReply, sender: 'bot' }]);
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiReply }]);

      // After 3+ user messages, auto-generate predictions
      if (newCount >= 3 && !predictions) {
        const allMessages = [...messages, newUserMessage].map(m => ({
          text: m.text,
          sender: m.sender === 'bot' ? 'assistant' : m.sender,
        }));
        
        const computedPredictions = await analyzeSymptoms(allMessages);
        setPredictions(computedPredictions);
        addHistoryRecord({
          type: 'chat',
          date: new Date().toISOString(),
          details: { predictions: computedPredictions },
        });
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: '⚠️ Could not reach the AI. Please check the backend server and Groq API key.', sender: 'bot' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalyze = async () => {
    if (isTyping || messages.length < 3) return;
    setIsTyping(true);

    const analyzingText = await getTranslation(language, 'analyzing');
    setMessages(prev => [...prev, { id: Date.now(), text: analyzingText, sender: 'bot' }]);

    const allMessages = messages.map(m => ({
      text: m.text,
      sender: m.sender === 'bot' ? 'assistant' : m.sender,
    }));

    const computedPredictions = await analyzeSymptoms(allMessages);
    setPredictions(computedPredictions);
    addHistoryRecord({
      type: 'chat',
      date: new Date().toISOString(),
      details: { predictions: computedPredictions },
    });

    const resultsText = await getTranslation(language, 'results');
    setMessages(prev => [...prev, { id: Date.now() + 1, text: resultsText, sender: 'bot' }]);
    setIsTyping(false);
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      {/* Chat Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--surface-border)'}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI Symptom Checker
              <span style={{ 
                fontSize: '0.65rem', fontWeight: 500, 
                background: 'linear-gradient(135deg, #4F46E5, #10B981)',
                padding: '3px 8px', borderRadius: '20px', color: 'white',
                letterSpacing: '0.5px'
              }}>
                GROQ
              </span>
            </h2>
            <p className="page-subtitle" style={{ fontSize: '0.85rem'}}>Powered by Llama 3.3 • Not medical advice</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Analyze Button */}
          {messages.length >= 4 && !predictions && (
            <button 
              className="btn btn-accent" 
              onClick={handleAnalyze}
              disabled={isTyping}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <BarChart3 size={16} />
              Analyze
            </button>
          )}

          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
            <Globe size={18} color="var(--text-secondary)" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontFamily: 'var(--font-family)' }}
            >
              <option value="en" style={{ color: 'black' }}>English</option>
              <option value="es" style={{ color: 'black' }}>Español</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '16px',
              background: msg.sender === 'user' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
              border: msg.sender === 'bot' ? '1px solid var(--surface-border)' : 'none',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
             <div style={{ padding: '12px 16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ color: 'var(--text-secondary)' }}>AI is thinking...</span>
             </div>
          </div>
        )}

        {/* Predictions Display */}
        {predictions && (
           <div className="animate-fade-in" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', width: '85%', alignSelf: 'center', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertCircle size={20} color="var(--primary-color)" />
                <h4 style={{ margin: 0 }}>AI-Predicted Conditions</h4>
                <span style={{ 
                  fontSize: '0.65rem', background: 'rgba(79, 70, 229, 0.2)', 
                  padding: '2px 8px', borderRadius: '4px', color: 'var(--primary-color)',
                  marginLeft: 'auto'
                }}>
                  Powered by Groq
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {predictions.map((p, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                      <span>{p.condition}</span>
                      <span style={{ fontWeight: 'bold', color: p.color }}>{p.probability}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.probability}%`, height: '100%', background: p.color, transition: 'width 1s ease-in-out', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                ⚠️ This is AI-generated analysis, not a medical diagnosis. Please consult a healthcare professional.
              </p>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
        <input 
          type="text" 
          className="input-field" 
          style={{ flex: 1 }}
          placeholder="Describe your symptoms..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" className="btn" disabled={isTyping || !inputMessage.trim()}>
          <Send size={18} />
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
