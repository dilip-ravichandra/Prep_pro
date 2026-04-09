import React, { useState, useEffect } from 'react';
import { Orb, GlassCard, Spinner } from '../components/UI';
import { adminAPI } from '../api/client';
import { DEFAULT_TECHNICAL_PROBLEMS } from '../data/defaultRoundQuestions';

const LANGUAGES = ['Java', 'Python', 'C++', 'JavaScript', 'C', 'C#'];

export default function AdminTechnicalPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    question: '',
    description: '',
    language: 'Java',
    difficulty: 'Easy',
    timeLimit: 30,
    testCases: [{ input: '', output: '', explanation: '' }],
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getTechnicalQuestions();
      setQuestions(response.data?.data || []);
    } catch (err) {
      setError('Failed to load questions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      question: '',
      description: '',
      language: 'Java',
      difficulty: 'Easy',
      timeLimit: 30,
      testCases: [{ input: '', output: '', explanation: '' }],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addTestCase = () => {
    setForm({
      ...form,
      testCases: [...form.testCases, { input: '', output: '', explanation: '' }],
    });
  };

  const removeTestCase = (idx) => {
    setForm({
      ...form,
      testCases: form.testCases.filter((_, i) => i !== idx),
    });
  };

  const updateTestCase = (idx, field, value) => {
    const updated = [...form.testCases];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, testCases: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.question.trim()) return setError('Question title is required.');
    if (!form.description.trim()) return setError('Description is required.');
    if (form.testCases.length === 0) return setError('At least one test case is required.');
    if (form.testCases.some(t => !t.input.trim() || !t.output.trim())) {
      return setError('All test cases must have input and output.');
    }

    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateTechnicalQuestion(editingId, form);
        setSuccess('Question updated successfully.');
      } else {
        await adminAPI.createTechnicalQuestion(form);
        setSuccess('Question created successfully.');
      }
      await loadQuestions();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question) => {
    setForm({
      question: question.question,
      description: question.description || '',
      language: question.language || 'Java',
      difficulty: question.difficulty || 'Easy',
      timeLimit: question.timeLimit || 30,
      testCases: question.testCases || [{ input: '', output: '', explanation: '' }],
    });
    setEditingId(question.id || question._id);
    setShowForm(true);
  };

  const handleLoadDefaultProblem = (problem) => {
    setForm({
      question: problem.title,
      description: problem.description || '',
      language: 'Java',
      difficulty: problem.difficulty || 'Easy',
      timeLimit: 30,
      testCases: (problem.examples || []).length
        ? problem.examples.map((ex) => ({ input: ex.input || '', output: ex.output || '', explanation: ex.explanation || '' }))
        : [{ input: '', output: '', explanation: '' }],
    });
    setEditingId(null);
    setShowForm(true);
    setSuccess('Default technical problem loaded into the editor. Modify and save it to add your own version.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await adminAPI.deleteTechnicalQuestion(id);
      setSuccess('Question deleted.');
      await loadQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL technical questions? This cannot be undone.')) return;
    setSaving(true);
    try {
      await adminAPI.clearTechnicalQuestions();
      setSuccess('All questions cleared.');
      await loadQuestions();
    } catch (err) {
      setError('Failed to clear questions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#8b5cf6" size={200} left="-80px" top="-60px" opacity={0.08} />

      <h1 className="gradient-text-purple" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        💻 Technical Questions Management
      </h1>
      <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 13, marginBottom: 20 }}>
        Create and manage coding challenges with test cases
      </p>

      {error && (
        <GlassCard style={{ padding: 12, marginBottom: 14, background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444' }}>
          <p style={{ color: '#fca5a5', fontSize: 12 }}>{error}</p>
        </GlassCard>
      )}
      {success && (
        <GlassCard style={{ padding: 12, marginBottom: 14, background: 'rgba(16,185,129,0.1)', borderLeft: '3px solid #10b981' }}>
          <p style={{ color: '#6ee7b7', fontSize: 12 }}>{success}</p>
        </GlassCard>
      )}

      <GlassCard style={{ padding: 14, marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginBottom: 8 }}>Default Technical Problems shown to candidates</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {DEFAULT_TECHNICAL_PROBLEMS.map((p) => (
            <div key={p.id} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{p.title}</div>
                <button
                  type="button"
                  onClick={() => handleLoadDefaultProblem(p)}
                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(196,181,253,0.25)', background: 'rgba(196,181,253,0.08)', color: '#c4b5fd', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                >
                  Edit
                </button>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.45)', marginBottom: 6 }}>{p.difficulty} · {p.tags.join(', ')}</div>
              <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.7)', lineHeight: 1.5 }}>{p.description}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Header Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#c4b5fd',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Question'}
        </button>
        <button
          onClick={handleClearAll}
          disabled={questions.length === 0 || saving}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            fontWeight: 600,
            cursor: questions.length === 0 || saving ? 'not-allowed' : 'pointer',
            fontSize: 12,
            opacity: questions.length === 0 || saving ? 0.5 : 1,
          }}
        >
          🗑️ Clear All ({questions.length})
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <GlassCard style={{ padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#c4b5fd' }}>
            {editingId ? '✎ Edit Question' : '+ Create New Question'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            {/* Title */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                Question Title *
              </label>
              <input
                className="input"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g., Two Sum, Reverse String"
                style={{ width: '100%' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                Problem Description *
              </label>
              <textarea
                className="input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter the full problem description"
                style={{ width: '100%', minHeight: 100, resize: 'vertical' }}
              />
            </div>

            {/* Settings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                  Language
                </label>
                <select
                  className="input"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                  Difficulty
                </label>
                <select
                  className="input"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                  Time Limit (min)
                </label>
                <input
                  className="input"
                  type="number"
                  value={form.timeLimit}
                  onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) })}
                  min="5"
                  max="180"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Test Cases */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', fontWeight: 600 }}>
                  Test Cases * ({form.testCases.length})
                </label>
                <button
                  type="button"
                  onClick={addTestCase}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: 'rgba(139,92,246,0.2)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#c4b5fd',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 10,
                  }}
                >
                  + Add Test Case
                </button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {form.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: 'rgba(139,92,246,0.08)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#c4b5fd' }}>Test Case {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTestCase(idx)}
                        disabled={form.testCases.length === 1}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#fca5a5',
                          fontWeight: 600,
                          cursor: form.testCases.length === 1 ? 'not-allowed' : 'pointer',
                          fontSize: 10,
                          opacity: form.testCases.length === 1 ? 0.5 : 1,
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 10, color: 'rgba(226,232,240,0.4)', display: 'block', marginBottom: 4 }}>
                          Sample Input
                        </label>
                        <textarea
                          className="input"
                          value={tc.input}
                          onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                          placeholder="e.g., 2 3"
                          style={{ width: '100%', minHeight: 60, fontSize: 11, fontFamily: 'monospace' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: 'rgba(226,232,240,0.4)', display: 'block', marginBottom: 4 }}>
                          Expected Output
                        </label>
                        <textarea
                          className="input"
                          value={tc.output}
                          onChange={(e) => updateTestCase(idx, 'output', e.target.value)}
                          placeholder="e.g., 5"
                          style={{ width: '100%', minHeight: 60, fontSize: 11, fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 10, color: 'rgba(226,232,240,0.4)', display: 'block', marginBottom: 4 }}>
                        Explanation (optional)
                      </label>
                      <textarea
                        className="input"
                        value={tc.explanation}
                        onChange={(e) => updateTestCase(idx, 'explanation', e.target.value)}
                        placeholder="Explain this test case..."
                        style={{ width: '100%', minHeight: 50, fontSize: 11 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(226,232,240,0.6)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: saving ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.15)',
                  border: saving ? '1px solid rgba(139,92,246,0.15)' : '1px solid rgba(139,92,246,0.3)',
                  color: saving ? 'rgba(139,92,246,0.5)' : '#c4b5fd',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                }}
              >
                {saving ? 'Saving...' : editingId ? 'Update Question' : 'Create Question'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Questions List */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(226,232,240,0.8)' }}>
          Questions ({questions.length})
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {questions.length === 0 ? (
            <GlassCard style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ color: 'rgba(226,232,240,0.35)', fontSize: 12 }}>No questions yet. Create one to get started.</p>
            </GlassCard>
          ) : (
            questions.map((q, idx) => (
              <GlassCard key={q.id || q._id || idx} style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#c4b5fd' }}>Q{idx + 1}</span>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: q.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : q.difficulty === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                        color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#fbbf24' : '#ef4444',
                      }}>
                        {q.difficulty}
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                        {q.language}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(226,232,240,0.35)' }}>• {q.timeLimit} min</span>
                    </div>
                    <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(226,232,240,0.9)' }}>
                      {q.question}
                    </h3>
                    <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.65)', marginBottom: 8, lineHeight: 1.4 }}>
                      {q.description.substring(0, 120)}...
                    </p>
                    <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.4)' }}>
                      📋 {q.testCases?.length || 0} test cases
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleEdit(q)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: 'rgba(168,85,247,0.15)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        color: '#a855f7',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(q.id || q._id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
