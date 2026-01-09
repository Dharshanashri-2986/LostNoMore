/* global chrome */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Settings, Save, Loader2, MousePointer2 } from 'lucide-react';
import { initializeAI, getAIResponse } from '../utils/ai';
import './index.css';

function App() {
  // ---------------- STATE ----------------
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm LostNoMore. Please enter your API Key in settings to start.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [ghostMode, setGhostMode] = useState(true);

  const chatEndRef = useRef(null);

  // ---------------- LOAD KEY ON START ----------------
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['openai_key'], (result) => {
        if (result.openai_key) {
          setApiKey(result.openai_key);
          initializeAI(result.openai_key);
          setMessages([
            { id: 1, text: "I'm ready! How can I help you navigate?", sender: 'ai' }
          ]);
        }
      });
    }
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------- SAVE API / MOCK KEY ----------------
  const saveKey = () => {
    const isMockKey = apiKey === 'mock-key';
    const isRealKey = apiKey.startsWith('sk-');

    if (!isMockKey && !isRealKey) {
      alert("Invalid Key. Use 'mock-key' for demo or a real OpenAI key (sk-...)");
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ openai_key: apiKey }, () => {
        initializeAI(apiKey);
        setShowSettings(false);
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: "API Key saved! Let's go.", sender: 'ai' }
        ]);
      });
    } else {
      // fallback (dev / localhost)
      initializeAI(apiKey);
      setShowSettings(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: "Key set in demo memory mode.", sender: 'ai' }
      ]);
    }
  };

  // ---------------- SEND MESSAGE ----------------
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(userMsg.text);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: aiResponse, sender: 'ai' }
      ]);
    } catch (error) {
      console.error("AI error: ",error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Something went wrong. Please try again.",
          sender: 'ai',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="app-container">

      {/* Header */}
      <div className="header">
        <div className="title">LostNoMore</div>
        <button className="btn-icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm font-bold mb-2">OpenAI API Key</div>
          <div className="flex gap-2">
            <input
              type="password"
              className="flex-1 p-2 border rounded text-sm"
              placeholder="sk-... or mock-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="btn-icon bg-blue-100 text-blue-600" onClick={saveKey}>
              <Save size={18} />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Key is stored locally on your device.
          </div>
        </div>
      )}

      {/* Controls */}
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
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message ai flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <button className="btn-icon" title="Voice Command">
          <Mic size={20} />
        </button>

        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />

        <button className="btn-icon" onClick={handleSend} disabled={isLoading}>
          <Send size={20} />
        </button>
      </div>

    </div>
  );
}

export default App;
