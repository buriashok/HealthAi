import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Globe, Loader2, AlertCircle, Sparkles, BarChart3, Mic, MicOff, Bot, User, Type, AlertTriangle } from 'lucide-react';
import { sendChatMessage, getTranslation, analyzeSymptoms } from '../../utils/symptomEngine';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { SUPPORTED_LANGUAGES } from '../../utils/translations';

const ChatInterface = () => {
  const { addHistoryRecord } = useAppContext();
  const { cycleFontSize, fontSize } = useTheme();
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── Initialize greeting ──────────────────────────────────────
  useEffect(() => {
    const loadGreeting = async () => {
      const greeting = await getTranslation(language, 'greeting');
      setMessages([
        { id: 1, text: greeting, sender: 'bot', timestamp: new Date() },
      ]);
      setChatHistory([]);
      setMessageCount(0);
      setPredictions(null);
    };
    loadGreeting();
  }, [language]);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, predictions]);

  // ─── Voice Input (Web Speech API) ─────────────────────────────
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : language === 'es' ? 'es-ES' : 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(prev => prev + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // ─── Send Message ─────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage;
    const now = new Date();
    const newUserMessage = { id: Date.now(), text: userText, sender: 'user', timestamp: now };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    const updatedHistory = [...chatHistory, { role: 'user', content: userText }];
    setChatHistory(updatedHistory);
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    try {
      const aiReply = await sendChatMessage(updatedHistory, language);

      setMessages(prev => [...prev, {
        id: Date.now() + 1, text: aiReply, sender: 'bot', timestamp: new Date()
      }]);
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiReply }]);

      // Auto-generate predictions after 3+ user messages
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
        { id: Date.now() + 1, text: '⚠️ Could not reach the AI. Please check the backend server.', sender: 'bot', timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalyze = async () => {
    if (isTyping || messages.length < 3) return;
    setIsTyping(true);

    const analyzingText = await getTranslation(language, 'analyzing');
    setMessages(prev => [...prev, { id: Date.now(), text: analyzingText, sender: 'bot', timestamp: new Date() }]);

    const allMessages = messages.map(m => ({
      text: m.text,
      sender: m.sender === 'bot' ? 'assistant' : m.sender,
    }));

    const computedPredictions = await analyzeSymptoms(allMessages);
    setPredictions(computedPredictions);
    addHistoryRecord({
      type: 'chat', date: new Date().toISOString(),
      details: { predictions: computedPredictions },
    });

    const resultsText = await getTranslation(language, 'results');
    setMessages(prev => [...prev, { id: Date.now() + 1, text: resultsText, sender: 'bot', timestamp: new Date() }]);
    setIsTyping(false);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>

      {/* ─── Chat Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--surface-border)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              HealthAI Chat
              <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>GEMINI</span>
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>Ask me anything about health</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {messages.length >= 4 && !predictions && (
            <button className="btn btn-accent btn-sm" onClick={handleAnalyze} disabled={isTyping}>
              <BarChart3 size={14} /> Analyze
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={cycleFontSize} title={`Font: ${fontSize}`}>
            <Type size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-hover)', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
            <Globe size={14} color="var(--text-muted)" />
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontFamily: 'var(--font-family)', fontSize: 'var(--text-xs)' }}>
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ color: 'black' }}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Messages Area ────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className="animate-slide-in" style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: '10px' }}>
            {/* Bot Avatar */}
            {msg.sender === 'bot' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-full)', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px',
              }}>
                <Bot size={16} color="white" />
              </div>
            )}

            <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                background: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--surface-solid)',
                border: msg.sender === 'bot' ? '1px solid var(--surface-border)' : 'none',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : 'var(--radius-lg)',
                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : 'var(--radius-lg)',
                color: 'var(--text-primary)',
                lineHeight: '1.7',
                fontSize: 'var(--text-sm)',
                overflowWrap: 'break-word',
              }}>
                {msg.sender === 'bot' ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: msg.sender === 'user' ? 'right' : 'left', paddingInline: '4px' }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: 'var(--radius-full)', flexShrink: 0,
                background: 'var(--secondary-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px',
              }}>
                <User size={16} color="white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Animation */}
        {isTyping && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bot size={16} color="white" />
            </div>
            <div style={{
              padding: '14px 20px', borderRadius: 'var(--radius-lg)', borderBottomLeftRadius: '4px',
              background: 'var(--surface-solid)', border: '1px solid var(--surface-border)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>AI is analyzing...</span>
            </div>
          </div>
        )}

        {/* Predictions */}
        {predictions && (
          <div className="animate-fade-in" style={{
            padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-color)', border: '1px solid var(--surface-border)',
            width: '85%', alignSelf: 'center', marginTop: 'var(--space-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
              <AlertCircle size={20} color="var(--secondary-color)" />
              <h4 style={{ margin: 0, fontWeight: 700 }}>AI-Predicted Conditions</h4>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Gemini AI</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {predictions.map((p, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontWeight: 600 }}>{p.condition}</span>
                    <span style={{ fontWeight: 700, color: p.color }}>{p.probability}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.probability}%`, height: '100%', background: p.color, transition: 'width 1s ease-in-out', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="disclaimer-banner" style={{ marginTop: 'var(--space-md)' }}>
              <AlertTriangle size={14} />
              <span>This is AI-generated analysis, not a medical diagnosis. Please consult a healthcare professional.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Area ───────────────────────────────────────── */}
      <form onSubmit={handleSendMessage} style={{
        display: 'flex', gap: '10px', paddingTop: 'var(--space-md)',
        borderTop: '1px solid var(--surface-border)', alignItems: 'center',
      }}>
        <button type="button" onClick={toggleVoiceInput} className={`btn btn-ghost`}
          style={{ padding: '10px', color: isListening ? 'var(--danger-color)' : 'var(--text-muted)' }}>
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <input
          type="text"
          className="input-field"
          style={{ flex: 1 }}
          placeholder={isListening ? '🎤 Listening...' : 'Ask me anything about health...'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" className="btn btn-primary" disabled={isTyping || !inputMessage.trim()} style={{ padding: '10px 18px' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
