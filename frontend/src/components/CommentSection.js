import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ candidateId, candidateEmail, roundType }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!candidateId || !roundType) return;
    setLoading(true);
    try {
      const res = await adminAPI.getComments(candidateId, roundType);
      setComments(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId, roundType]);

  const sendComment = async () => {
    if (!message.trim()) return;
    await adminAPI.addComment({
      candidateId,
      candidateEmail,
      roundType,
      message,
      adminEmail: user?.email,
    });
    setMessage('');
    await loadComments();
  };

  const removeComment = async (id) => {
    await adminAPI.deleteComment(id);
    await loadComments();
  };

  if (!candidateId) return null;

  return (
    <div style={{ marginTop: 10, padding: 10, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#00f5ff' }}>Feedback & Communication</div>

      <div style={{ display: 'grid', gap: 6, maxHeight: 140, overflow: 'auto', marginBottom: 8 }}>
        {loading ? (
          <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>No comments yet.</div>
        ) : (
          comments.map((c) => (
            <div key={c.id || c._id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11 }}>
              <span style={{ color: c.isAdminComment ? '#fbbf24' : '#10b981', minWidth: 60 }}>
                {c.isAdminComment ? 'Admin' : 'Candidate'}
              </span>
              <span style={{ color: 'rgba(226,232,240,0.75)', flex: 1 }}>{c.message}</span>
              {user?.role === 'ADMIN' && (
                <button onClick={() => removeComment(c.id || c._id)} style={{ border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontSize: 11 }}>✕</button>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="input"
          placeholder="Write feedback for candidate..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, fontSize: 11 }}
        />
        <button onClick={sendComment} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(0,245,255,0.3)', background: 'rgba(0,245,255,0.15)', color: '#00f5ff', fontSize: 11, cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  );
}
