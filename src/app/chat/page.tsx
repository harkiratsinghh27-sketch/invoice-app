'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './chat.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Hello! I am your AI Invoice Assistant. You can ask me questions about your invoices like "What is my total spending this month?" or "Show me all invoices from Acme Corp."'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // In real app, call /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply
      }]);
      
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI Assistant</h1>
        <p className={styles.subtitle}>Ask questions about your invoice data</p>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.wrapperUser : styles.wrapperBot}`}
            >
              <div className={`${styles.avatar} ${msg.role === 'user' ? styles.avatarUser : styles.avatarBot}`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p style={{margin: '0 0 10px 0', lineHeight: 1.5}} {...props} />,
                      ul: ({node, ...props}) => <ul style={{margin: '0 0 10px 20px', lineHeight: 1.5}} {...props} />,
                      ol: ({node, ...props}) => <ol style={{margin: '0 0 10px 20px', lineHeight: 1.5}} {...props} />,
                      li: ({node, ...props}) => <li style={{marginBottom: '4px'}} {...props} />,
                      a: ({node, ...props}) => <a style={{color: 'var(--accent-primary)', textDecoration: 'underline'}} {...props} />,
                      table: ({node, ...props}) => (
                        <div className={styles.markdownTableContainer}>
                          <table className={styles.markdownTable} {...props} />
                        </div>
                      ),
                      th: ({node, ...props}) => <th className={styles.markdownTh} {...props} />,
                      td: ({node, ...props}) => <td className={styles.markdownTd} {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.messageWrapper} ${styles.wrapperBot}`}>
              <div className={`${styles.avatar} ${styles.avatarBot}`}>
                <Bot size={18} />
              </div>
              <div className={`${styles.message} ${styles.messageBot} ${styles.loadingMessage}`}>
                <Loader2 size={16} className={styles.spinner} />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder="Ask a question about your invoices..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
