import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Navigation, MousePointer2 } from 'lucide-react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm LostNoMore. How can I help you navigate today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ghostMode, setGhostMode] = useState(true);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. Simulate AI Response (Temporary)
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        text: `I heard you say: "${userMsg.text}". I'm setting up my brain now!`, 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Logic for Web Speech API will go here later
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="title">LostNoMore</div>
        <Navigation size={20} className="text-blue-600" />
      </div>

      {/* Control Deck */}
      <div className="controls">
        <label className="toggle-label">
          <input 
            type="checkbox" 
            checked={ghostMode} 
            onChange={(e) => setGhostMode(e.target.checked)} 
          />
          <MousePointer2 size={14} /> Ghost Mouse
        </label>
      </div>

      {/* Chat Area */}
      <div className="chat-window">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <button 
          className={`btn-icon ${isListening ? 'active' : ''}`}
          onClick={toggleVoice}
          title="Voice Command"
        >
          <Mic size={20} />
        </button>
        
        <input 
          type="text" 
          placeholder="Type or speak..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        
        <button className="btn-icon" onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default App;