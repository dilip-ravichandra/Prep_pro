import React, { useEffect, useState } from 'react';
import { Orb, GlassCard, Spinner } from '../components/UI';
import { adminAPI } from '../api/client';
import CommentSection from '../components/CommentSection';
import { DEFAULT_BEHAVIORAL_QUESTIONS } from '../data/defaultRoundQuestions';

export default function AdminBehavioralPage() {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    question: '',
    description: '',
    difficulty: 'Easy',
    videoDurationSeconds: 120,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [qRes, sRes] = await Promise.all([
        adminAPI.getBehavioralQuestions(),
        adminAPI.getBehavioralSubmissions(),
      ]);
      setQuestions(qRes.data?.data || []);
      setSubmissions(sRes.data?.data || []);
    } catch {
      setError('Failed to load behavioral data.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      question: '',
      description: '',
      difficulty: 'Easy',
      videoDurationSeconds: 120,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.question.trim()) return setError('Question is required.');

    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateBehavioralQuestion(editingId, form);
        setSuccess('Behavioral question updated.');
      } else {
        await adminAPI.createBehavioralQuestion(form);
        setSuccess('Behavioral question created.');
      }
      await loadAll();
      resetForm();
    } catch {
      setError('Failed to save behavioral question.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q) => {
    setForm({
      question: q.question || '',
      description: q.description || '',
      difficulty: q.difficulty || 'Easy',
      videoDurationSeconds: q.videoDurationSeconds || 120,
    });
    setEditingId(q.id || q._id);
    setShowForm(true);
  };

  const handleLoadDefaultQuestion = (q) => {
    setForm({
      question: q.question || '',
      description: q.description || '',
      difficulty: q.difficulty || 'Easy',
      videoDurationSeconds: q.videoDurationSeconds || 120,
    });
    setEditingId(null);
    setShowForm(true);
    setSuccess('Default behavioral question loaded into the editor. Modify and save it to add your own version.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this behavioral question?')) return;
    try {
      await adminAPI.deleteBehavioralQuestion(id);
      setSuccess('Question deleted.');
      await loadAll();
    } catch {
      setError('Failed to delete question.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL behavioral questions?')) return;
    try {
      await adminAPI.clearBehavioralQuestions();
      setSuccess('All behavioral questions cleared.');
      await loadAll();
    } catch {
      setError('Failed to clear behavioral questions.');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#10b981" size={180} left="-60px" top="-40px" opacity={0.08} />

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }} className="gradient-text">
        🎬 Behavioral Round Management
      </h1>
      <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 13, marginBottom: 20 }}>
        Create behavioral questions, review video submissions, and evaluate candidates.
      </p>

      {error && <GlassCard style={{ padding: 12, marginBottom: 12, background: 'rgba(239,68,68,0.12)' }}><p style={{ color: '#fca5a5', fontSize: 12 }}>{error}</p></GlassCard>}
      {success && <GlassCard style={{ padding: 12, marginBottom: 12, background: 'rgba(16,185,129,0.12)' }}><p style={{ color: '#6ee7b7', fontSize: 12 }}>{success}</p></GlassCard>}

      <GlassCard style={{ padding: 14, marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#6ee7b7', marginBottom: 8 }}>Default Behavioral Questions shown to candidates</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {DEFAULT_BEHAVIORAL_QUESTIONS.map((q) => (
            <div key={q.id} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{q.question}</div>
                <button
                  type="button"
                  onClick={() => handleLoadDefaultQuestion(q)}
                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(110,231,183,0.25)', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                >
                  Edit
                </button>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.45)' }}>{q.category} · {q.videoDurationSeconds}s</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <button onClick={() => setShowForm(v => !v)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          {showForm ? '✕ Cancel' : '+ New Behavioral Question'}
        </button>
        <button onClick={handleClearAll} disabled={saving || questions.length === 0} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: questions.length === 0 ? 0.5 : 1 }}>
          🗑️ Clear All
        </button>
      </div>

      {showForm && (
        <GlassCard style={{ padding: 16, marginBottom: 18 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
            <input className="input" placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <input className="input" type="number" min="30" max="600" value={form.videoDurationSeconds} onChange={(e) => setForm({ ...form, videoDurationSeconds: parseInt(e.target.value, 10) || 120 })} placeholder="Duration in seconds" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={resetForm} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', color: 'rgba(226,232,240,0.7)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', cursor: 'pointer', fontWeight: 600 }}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </GlassCard>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
        <GlassCard style={{ padding: 14 }}>
          <h3 style={{ marginBottom: 10, color: '#6ee7b7', fontSize: 13 }}>Questions ({questions.length})</h3>
          <div style={{ display: 'grid', gap: 10, maxHeight: 440, overflow: 'auto' }}>
            {questions.map((q, i) => (
              <div key={q.id || q._id || i} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{q.question}</div>
                <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.55)', marginBottom: 8 }}>{q.description || 'No description'}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#10b981' }}>{q.difficulty}</span>
                  <span style={{ fontSize: 10, color: 'rgba(226,232,240,0.45)' }}>{q.videoDurationSeconds || 120}s</span>
                  <button onClick={() => handleEdit(q)} style={{ marginLeft: 'auto', padding: '4px 8px', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.15)', color: '#c4b5fd', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>Edit</button>
                  <button onClick={() => handleDelete(q.id || q._id)} style={{ padding: '4px 8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>Delete</button>
                </div>
              </div>
            ))}
            {questions.length === 0 && <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)' }}>No behavioral questions yet.</div>}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: 14 }}>
          <h3 style={{ marginBottom: 10, color: '#00f5ff', fontSize: 13 }}>Candidate Video Submissions</h3>
          <div style={{ display: 'grid', gap: 10, maxHeight: 440, overflow: 'auto' }}>
            {submissions.map((s, i) => (
              <div key={s.id || s._id || i} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.candidateName || s.userName || s.name || 'Candidate'}</div>
                <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.55)' }}>{s.candidateEmail || s.userEmail || s.email || ''}</div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.7)' }}>Question: {s.question || '-'}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(226,232,240,0.7)' }}>Final Score: {s.score ?? '-'}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(226,232,240,0.7)' }}>Face Presence: {s.facePresenceScore ?? '-'}%</div>
                <div style={{ marginTop: 4, fontSize: 11, color: s.isSuspicious ? '#f59e0b' : '#10b981' }}>
                  {s.isSuspicious ? '⚠ Suspicious' : '✅ Clear'}
                </div>
                {s.videoUrl ? (
                  <video controls style={{ width: '100%', marginTop: 8, borderRadius: 6 }} src={s.videoUrl} />
                ) : (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>No video URL available in submission payload.</div>
                )}
                {s.transcript && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.65)', background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6 }}>
                    <strong>Transcript:</strong> {s.transcript}
                  </div>
                )}
                {(s.strengths?.length || s.weaknesses?.length || s.suggestions?.length) ? (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.75)', display: 'grid', gap: 5 }}>
                    {s.strengths?.length ? <div><strong>Strengths:</strong> {s.strengths.join(', ')}</div> : null}
                    {s.weaknesses?.length ? <div><strong>Weaknesses:</strong> {s.weaknesses.join(', ')}</div> : null}
                    {s.suggestions?.length ? <div><strong>Suggestions:</strong> {s.suggestions.join(', ')}</div> : null}
                  </div>
                ) : null}
                <CommentSection
                  candidateId={s.userId || s.candidateId || s.id}
                  candidateEmail={s.candidateEmail || s.userEmail || s.email || ''}
                  roundType="BEHAVIORAL"
                />
              </div>
            ))}
            {submissions.length === 0 && <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)' }}>No submissions found.</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
