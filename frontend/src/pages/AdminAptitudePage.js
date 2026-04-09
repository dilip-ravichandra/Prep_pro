import React, { useState, useEffect } from 'react';
import { Orb, GlassCard, Spinner } from '../components/UI';
import { adminAPI } from '../api/client';
import { DEFAULT_APTITUDE_QUESTIONS } from '../data/defaultRoundQuestions';

export default function AdminAptitudePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'Easy',
    topic: '',
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAptitudeQuestions();
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
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'Easy',
      topic: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleOptionChange = (idx, value) => {
    const newOpts = [...form.options];
    newOpts[idx] = value;
    setForm({ ...form, options: newOpts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.question.trim()) return setError('Question is required.');
    if (form.options.some(o => !o.trim())) return setError('All options must be filled.');

    setSaving(true);
    try {
      if (editingId) {
        await adminAPI.updateAptitudeQuestion(editingId, form);
        setSuccess('Question updated successfully.');
      } else {
        await adminAPI.createAptitudeQuestion(form);
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
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0,
      difficulty: question.difficulty || 'Easy',
      topic: question.topic || '',
    });
    setEditingId(question.id || question._id);
    setShowForm(true);
  };

  const handleLoadDefaultQuestion = (question) => {
    setForm({
      question: question.question,
      options: question.options || ['', '', '', ''],
      correctAnswer: 0,
      difficulty: question.difficulty || 'Easy',
      topic: question.category || '',
    });
    setEditingId(null);
    setShowForm(true);
    setSuccess('Default aptitude question loaded into the editor. Modify and save it to add your own version.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await adminAPI.deleteAptitudeQuestion(id);
      setSuccess('Question deleted.');
      await loadQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete ALL aptitude questions? This cannot be undone.')) return;
    setSaving(true);
    try {
      await adminAPI.clearAptitudeQuestions();
      setSuccess('All questions cleared.');
      await loadQuestions();
    } catch (err) {
      setError('Failed to clear questions.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!form.topic.trim()) return setError('Please enter a topic for AI generation.');
    setGeneratingAI(true);
    setError('');
    try {
      const response = await adminAPI.generateAIQuestion(form.topic, form.difficulty);
      if (response.data?.data) {
        const { question, options, correctAnswer } = response.data.data;
        setForm({
          ...form,
          question,
          options: options || ['', '', '', ''],
          correctAnswer: correctAnswer || 0,
        });
        setSuccess('AI-generated question loaded. Review and save.');
      } else {
        setError('Failed to generate question.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI generation failed.');
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#00f5ff" size={200} left="-80px" top="-60px" opacity={0.08} />

      <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        📝 Aptitude Questions Management
      </h1>
      <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 13, marginBottom: 20 }}>
        Create, edit, and manage multiple choice questions
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
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#00f5ff', marginBottom: 8 }}>Default Aptitude Questions shown to candidates</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {DEFAULT_APTITUDE_QUESTIONS.map((q) => (
            <div key={q.id} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{q.question}</div>
                <button
                  type="button"
                  onClick={() => handleLoadDefaultQuestion(q)}
                  style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(0,245,255,0.25)', background: 'rgba(0,245,255,0.08)', color: '#00f5ff', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                >
                  Edit
                </button>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.45)', marginBottom: 6 }}>{q.category} · {q.difficulty}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6 }}>
                {q.options.map((opt, idx) => (
                  <div key={idx} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: 'rgba(0,245,255,0.06)', color: 'rgba(226,232,240,0.8)' }}>{String.fromCharCode(65 + idx)}. {opt}</div>
                ))}
              </div>
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
            background: 'rgba(0,245,255,0.15)',
            border: '1px solid rgba(0,245,255,0.3)',
            color: '#00f5ff',
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
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#00f5ff' }}>
            {editingId ? '✎ Edit Question' : '+ Create New Question'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            {/* Topic and AI Generate */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                  Topic (for AI generation)
                </label>
                <input
                  className="input"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g., Arrays, Loops, Functions"
                  style={{ width: '100%' }}
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generatingAI || !form.topic.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  background: generatingAI || !form.topic.trim() ? 'rgba(255,255,255,0.05)' : 'rgba(168,85,247,0.15)',
                  border: generatingAI || !form.topic.trim() ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(168,85,247,0.3)',
                  color: generatingAI || !form.topic.trim() ? 'rgba(226,232,240,0.3)' : '#a855f7',
                  fontWeight: 600,
                  cursor: generatingAI || !form.topic.trim() ? 'not-allowed' : 'pointer',
                  fontSize: 11,
                  alignSelf: 'flex-end',
                  whiteSpace: 'nowrap',
                }}
              >
                {generatingAI ? '⏳ Generating...' : '✨ Generate with AI'}
              </button>
            </div>

            {/* Question */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 4 }}>
                Question *
              </label>
              <textarea
                className="input"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Enter the question text"
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
              />
            </div>

            {/* Difficulty */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                  Correct Answer
                </label>
                <select
                  className="input"
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>
            </div>

            {/* Options */}
            <div>
              <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', display: 'block', marginBottom: 8 }}>
                Options (all required) *
              </label>
              <div style={{ display: 'grid', gap: 8 }}>
                {form.options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: 6,
                      background: form.correctAnswer === idx ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      border: form.correctAnswer === idx ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: form.correctAnswer === idx ? '#10b981' : 'rgba(226,232,240,0.5)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <input
                      className="input"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      style={{ flex: 1 }}
                    />
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
                  background: saving ? 'rgba(0,245,255,0.1)' : 'rgba(0,245,255,0.15)',
                  border: saving ? '1px solid rgba(0,245,255,0.15)' : '1px solid rgba(0,245,255,0.3)',
                  color: saving ? 'rgba(0,245,255,0.5)' : '#00f5ff',
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
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#00f5ff' }}>Q{idx + 1}</span>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: q.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : q.difficulty === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                        color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#fbbf24' : '#ef4444',
                      }}>
                        {q.difficulty}
                      </span>
                      {q.topic && <span style={{ fontSize: 10, color: 'rgba(226,232,240,0.35)' }}>• {q.topic}</span>}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: 'rgba(226,232,240,0.85)' }}>
                      {q.question}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                      {q.options?.map((opt, oidx) => (
                        <div
                          key={oidx}
                          style={{
                            padding: '6px 8px',
                            borderRadius: 4,
                            background: q.correctAnswer === oidx ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                            border: q.correctAnswer === oidx ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            color: q.correctAnswer === oidx ? '#6ee7b7' : 'rgba(226,232,240,0.6)',
                          }}
                        >
                          <strong>{String.fromCharCode(65 + oidx)}.</strong> {opt}
                          {q.correctAnswer === oidx && <span style={{ marginLeft: 4, color: '#10b981' }}>✓</span>}
                        </div>
                      ))}
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
