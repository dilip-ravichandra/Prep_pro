import React, { useEffect, useRef, useState } from 'react';
import { chatAPI } from '../api/client';

const STORAGE_KEY = 'isp_chat_history';
const RENAME_NOTICE = 'Quick update: InterviewSimPro is now renamed to PrepPro.';

const normalizeBranding = (text = '') =>
  text
    .replace(/InterviewSimPro/gi, 'PrepPro')
    .replace(/InterviewSim\s*Pro/gi, 'PrepPro')
    .replace(/InterviewSim/gi, 'PrepPro');

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = Array.isArray(parsed)
          ? parsed.map((m) => ({ ...m, text: normalizeBranding(m?.text || '') }))
          : parsed;
        const hasRenameNotice = Array.isArray(parsed) && parsed.some(
          (m) => m?.role === 'bot' && typeof m?.text === 'string' && m.text.includes('renamed to PrepPro')
        );
        if (Array.isArray(normalized) && !hasRenameNotice) {
          return [...normalized, { role: 'bot', text: RENAME_NOTICE }];
        }
        return normalized;
      }
    } catch {}
    return [
      { role: 'bot', text: 'Hi! I am your PrepPro assistant. Ask me about rounds, tips, or navigation.' },
      { role: 'bot', text: RENAME_NOTICE },
    ];
  });
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const pageContext = window.location.pathname;
      const res = await chatAPI.send({ message: text, pageContext });
      const reply = normalizeBranding(res?.data?.data?.reply || 'Something went wrong, please try again');
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Something went wrong, please try again' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 9999 }}>
      {open && (
        <div
          className="glass-card"
          style={{
            width: 340,
            height: 460,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(0,245,255,0.25)',
            boxShadow: '0 0 24px rgba(0,245,255,0.2)',
            marginBottom: 10,
          }}
        >
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#00f5ff',
            fontWeight: 700,
            fontSize: 13,
          }}>
            PrepPro Assistant
            <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setOpen(false)}>×</button>
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'rgba(0,245,255,0.12)' : 'rgba(139,92,246,0.12)',
                border: `1px solid ${m.role === 'user' ? 'rgba(0,245,255,0.3)' : 'rgba(139,92,246,0.3)'}`,
                borderRadius: 10,
                color: 'rgba(226,232,240,0.95)',
                fontSize: 12,
                padding: '8px 10px',
                maxWidth: '88%',
                lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'rgba(226,232,240,0.6)', fontSize: 12 }}>
                Assistant is typing...
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <input
              className="input"
              style={{ fontSize: 12, padding: '8px 10px' }}
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12 }} onClick={send} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{
          borderRadius: '999px',
          width: 58,
          height: 58,
          padding: 0,
          fontSize: 24,
          boxShadow: '0 0 28px rgba(0,245,255,0.4)',
        }}
        onClick={() => setOpen((o) => !o)}
        title="Open assistant"
      >
        💬
      </button>
    </div>
  );
}
