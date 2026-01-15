import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there! 👋 I'm your Peerly assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000';

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
           throw new Error(data.message || 'Daily limit reached');
        }
        throw new Error(data.message || 'Something went wrong');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.message === 'Daily limit reached' 
          ? 'Daily limit reached. Please try again tomorrow.' 
          : 'Sorry, I encountered an error. Please try again later.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[600px] h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--button-action)] flex items-center justify-center text-white">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Peerly Assistant</h3>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-accent)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-secondary)]">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${ 
                      msg.role === 'user'
                        ? 'bg-[var(--button-action)] text-white rounded-br-sm'
                        : 'bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-bl-sm'
                    } ${msg.isError ? 'border-red-500 text-red-500 bg-red-50' : ''}`}
                    style={msg.role === 'assistant' && !msg.isError ? { color: 'var(--text-primary)' } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[var(--button-action)]" />
                    <span className="text-xs text-[var(--text-secondary)]">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--button-action)] transition-all"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg bg-[var(--button-action)] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="text-[10px] text-center mt-2 text-[var(--text-secondary)] opacity-70">
                Powered by Llama 3
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[var(--button-action)] shadow-lg flex items-center justify-center text-white pointer-events-auto transition-all hover:shadow-[0_0_20px_rgba(62,207,142,0.5)]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default Chatbot;
