
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, ChatMessage } from '../types';
import { askAssistant } from '../services/gemini';
import { db } from '../services/storage';

const AIChatScreen: React.FC<{ user: User }> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = db.getChatHistory(user.id);
    if (history.length === 0) {
      const welcome: ChatMessage = {
        id: 'welcome',
        userId: user.id,
        role: 'ai',
        text: `Salaam ${user.name.split(' ')[0]}, I'm your RECOVR Marshall. How can I assist your field operations today?`,
        timestamp: Date.now()
      };
      setMessages([welcome]);
      db.saveChatMessage(welcome);
    } else {
      setMessages(history);
    }
  }, [user.id, user.name]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input || loading) return;
    
    const userMsgText = input;
    setInput('');

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      role: 'user',
      text: userMsgText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    db.saveChatMessage(userMsg);
    setLoading(true);

    try {
      const aiResponseText = await askAssistant(userMsgText);
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        role: 'ai',
        text: aiResponseText || "System error. Please reconnect to field HQ.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      db.saveChatMessage(aiMsg);
    } catch (e) {
      const errMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        userId: user.id,
        role: 'ai',
        text: "Gateway timeout. Please check field connectivity.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Marshall" role={user.role}>
      <div className="flex flex-col h-[calc(100vh-180px)]">
        
        {/* Android-style Conversation List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pt-4 px-1 no-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-3xl relative ${m.role === 'ai' ? 'bg-indigo-600 text-white rounded-bl-none shadow-md' : 'bg-white text-slate-800 rounded-br-none shadow-sm border border-slate-100'}`}>
                <p className="text-[14px] leading-relaxed font-medium">{m.text}</p>
                <span className={`text-[8px] font-bold block mt-2 ${m.role === 'ai' ? 'text-indigo-200' : 'text-slate-400'} text-right`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-indigo-50 px-4 py-3 rounded-2xl flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        {/* M3 Style Input Field (Android Messaging feel) */}
        <div className="pt-4 pb-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-full pl-6 pr-2 py-2 shadow-sm focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about recovery..."
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input}
              className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center disabled:opacity-30 ripple-effect active:scale-90 transition-all"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIChatScreen;
