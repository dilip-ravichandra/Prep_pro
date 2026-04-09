import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Orb, GlassCard, Spinner } from '../components/UI';
import { adminAPI } from '../api/client';

export default function AdminDashboard() {
  const [form, setForm] = useState({
    question: '',
    type: 'APTITUDE',
    language: 'JAVA',
    difficulty: 'Easy',
  });
  const [saving, setSaving] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    return {
      total: submissions.length,
      avg: submissions.length
        ? Math.round(submissions.reduce((s, x) => s + (x.score || 0), 0) / submissions.length)
        : 0,
    };
  }, [submissions]);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await adminAPI.getSubmissions();
      setSubmissions(res.data?.data || []);
    } catch {
      setError('Failed to load candidate submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!form.question.trim()) return setError('Question is required.');

    setSaving(true);
    try {
      await adminAPI.addQuestion(form);
      setMsg('Question added successfully.');
      setForm((f) => ({ ...f, question: '' }));
      await loadSubmissions();
    } catch {
      setError('Failed to add question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
        <Orb color="#f59e0b" size={190} left="-50px" top="-50px" opacity={0.08} />

        <h1 className="gradient-text-warm" style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 12, marginBottom: 18 }}>
          Manage questions and review candidate submissions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <GlassCard style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginBottom: 4 }}>TOTAL SUBMISSIONS</div>
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 26, color: '#00f5ff', fontWeight: 700 }}>{stats.total}</div>
          </GlassCard>
          <GlassCard style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginBottom: 4 }}>AVERAGE SCORE</div>
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 26, color: '#8b5cf6', fontWeight: 700 }}>{stats.avg}%</div>
          </GlassCard>
        </div>

        <GlassCard style={{ padding: 18, marginBottom: 14 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#00f5ff' }}>Add Question</h2>
          <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>Question</label>
              <input className="input" value={form.question} onChange={onChange('question')} placeholder="Enter question text" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>Type</label>
              <select className="input" value={form.type} onChange={onChange('type')}>
                <option>APTITUDE</option>
                <option>TECHNICAL</option>
                <option>BEHAVIORAL</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>Language</label>
              <select className="input" value={form.language} onChange={onChange('language')}>
                <option>JAVA</option>
                <option>PYTHON</option>
                <option>C</option>
                <option>CPP</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>Difficulty</label>
              <select className="input" value={form.difficulty} onChange={onChange('difficulty')}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ height: 42 }}>
              {saving ? <Spinner size={14} /> : 'Add'}
            </button>
          </form>

          {msg && <div style={{ marginTop: 10, fontSize: 12, color: '#10b981' }}>{msg}</div>}
          {error && <div style={{ marginTop: 10, fontSize: 12, color: '#ef4444' }}>{error}</div>}
        </GlassCard>

        <GlassCard style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#8b5cf6' }}>Candidate Submissions</h2>
            <button className="btn btn-ghost" onClick={loadSubmissions} style={{ fontSize: 11 }}>Refresh</button>
          </div>

          {loadingSubmissions ? (
            <div style={{ padding: 20, textAlign: 'center' }}><Spinner size={22} /></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: 'rgba(226,232,240,0.45)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Candidate</th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Question</th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Submitted</th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Score</th>
                    <th style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 14, color: 'rgba(226,232,240,0.5)' }}>No submissions yet.</td>
                    </tr>
                  ) : submissions.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 8px' }}>{s.candidateName}</td>
                      <td style={{ padding: '10px 8px' }}>{s.question}</td>
                      <td style={{ padding: '10px 8px', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.submitted}>{s.submitted}</td>
                      <td style={{ padding: '10px 8px', color: '#00f5ff', fontWeight: 600 }}>{Math.round(s.score || 0)}%</td>
                      <td style={{ padding: '10px 8px', color: 'rgba(226,232,240,0.75)' }}>{s.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
