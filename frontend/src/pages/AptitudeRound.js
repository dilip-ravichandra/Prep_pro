import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aptitudeAPI } from '../api/client';
import { useResults } from '../context/ResultsContext';
import { Orb, ProgressBar, DiffBadge, TimerDisplay, ProgressDots, Spinner } from '../components/UI';
import { DEFAULT_APTITUDE_QUESTIONS } from '../data/defaultRoundQuestions';

const TOTAL_TIME = 900; // 15 minutes

export default function AptitudeRound() {
  const navigate = useNavigate();
  const { saveResult } = useResults();

  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [time, setTime] = useState(TOTAL_TIME);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [correctness, setCorrectness] = useState(null); // from server after submit
  const timerRef = useRef(null);
  const startTime = useRef(Date.now());

  // Load questions
  useEffect(() => {
    aptitudeAPI.getQuestions()
      .then(res => setQuestions(res.data.data))
      .catch(() => setQuestions(FALLBACK_QUESTIONS))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = useCallback(async (auto = false) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const taken = Math.round((Date.now() - startTime.current) / 1000);
    const questionIds = questions.map((q) => String(q.id ?? q._id ?? q.questionId ?? ''));
    try {
      const res = await aptitudeAPI.submit({ answers, questionIds, questionCount: questions.length, timeTakenSeconds: taken });
      const data = res.data.data;
      saveResult('aptitude', { ...data, percentage: data.percentage, pct: data.percentage });
      if (data.answerCorrectness) setCorrectness(data.answerCorrectness);
      navigate('/break', {
        state: {
          nextPath: '/technical-round',
          nextRoundLabel: 'Technical Round',
          previousRoundLabel: 'Aptitude Round',
          previousScore: Number(data.percentage || 0),
          auto,
        },
      });
    } catch {
      // If backend is down, do local evaluation using fallback
      const localResult = localEvaluate(answers, taken);
      saveResult('aptitude', localResult);
      navigate('/break', {
        state: {
          nextPath: '/technical-round',
          nextRoundLabel: 'Technical Round',
          previousRoundLabel: 'Aptitude Round',
          previousScore: Number(localResult.percentage || 0),
          auto,
        },
      });
    } finally {
      setSubmitting(false);
    }
  }, [answers, navigate, questions, saveResult]);

  // Timer
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, handleSubmit]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050812' }}>
      <Spinner size={36} />
    </div>
  );

  const q = questions[qi];
  const sel = answers[qi];
  const pct = (qi / questions.length) * 100;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: 22, position: 'relative', overflow: 'hidden' }}>
      <Orb color="#00f5ff" size={200} left="-50px" top="-50px" opacity={0.07} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10, position: 'relative', zIndex: 1 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 700 }} className="gradient-text">🧠 Aptitude Round</h1>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>Logical · Quantitative · Verbal · Patterns</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <ProgressDots total={questions.length} current={qi} answered={answers} color="#00f5ff" />
          <TimerDisplay seconds={time} warningAt={60} />
          <button className="btn btn-purple" onClick={() => navigate('/dashboard')} style={{ fontSize: 11, padding: '6px 13px' }}>✕ Exit</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 18, position: 'relative', zIndex: 1 }}>
        <ProgressBar pct={pct} />
      </div>

      {/* Question Card */}
      <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="glass-card animate-fadeUp" style={{ padding: 24, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <DiffBadge diff={q?.difficulty} />
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' }}>{q?.category}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>Q {qi + 1}/{questions.length}</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.65, color: '#e2e8f0' }}>{q?.question}</p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
          {q?.options?.map((opt, i) => {
            let cls = 'mcq-option';
            if (revealed && correctness) {
              if (correctness[qi] === true && i === sel) cls += ' correct';
              else if (i === sel && correctness[qi] === false) cls += ' wrong';
            } else if (revealed) {
              // Local fallback
            } else if (i === sel) {
              cls += ' selected';
            }
            return (
              <div key={i} className={cls} onClick={() => !revealed && setAnswers(a => ({ ...a, [qi]: i }))}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {['A','B','C','D'][i]}
                </div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button className="btn btn-purple" onClick={() => { setQi(q => q - 1); setRevealed(false); }} disabled={qi === 0} style={{ fontSize: 12 }}>← Prev</button>
          <div style={{ display: 'flex', gap: 9 }}>
            {!revealed && sel != null && (
              <button className="btn btn-cyan" onClick={() => setRevealed(true)} style={{ fontSize: 12 }}>Check Answer</button>
            )}
            {qi < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => { setQi(q => q + 1); setRevealed(false); }} style={{ fontSize: 12 }}>Next →</button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting} style={{ fontSize: 12 }}>
                {submitting ? <Spinner size={16} /> : 'Finish Round'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Local Evaluation (when backend is offline) ───────────────
const CORRECT = [1,1,1,1,2,1,2,1,1,1];
function localEvaluate(answers, timeTaken) {
  let correct = 0;
  CORRECT.forEach((ans, i) => { if (answers[i] === ans) correct++; });
  const pct = Math.round(correct * 100 / 10);
  return {
    correctCount: correct, wrongCount: 10 - correct - 0,
    skippedCount: 10 - Object.keys(answers).length,
    totalQuestions: 10, percentage: pct, pct,
    grade: pct >= 85 ? 'A+' : pct >= 70 ? 'B+' : pct >= 55 ? 'C+' : 'D',
    timeTakenSeconds: timeTaken,
    categoryScores: { Quantitative: 70, Logical: 65, Verbal: 80, Pattern: 75 },
    recommendations: ['Keep practising quantitative problems daily.'],
  };
}

// ─── Fallback Questions (when backend is offline) ─────────────
const FALLBACK_QUESTIONS = DEFAULT_APTITUDE_QUESTIONS;
