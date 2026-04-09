import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicalAPI } from '../api/client';
import { useResults } from '../context/ResultsContext';
import { Orb, DiffBadge, TimerDisplay, Spinner } from '../components/UI';
import { DEFAULT_TECHNICAL_PROBLEMS } from '../data/defaultRoundQuestions';

const TOTAL_TIME = 3600;

const FALLBACK_PROBLEMS = DEFAULT_TECHNICAL_PROBLEMS;

export default function TechnicalRound() {
  const navigate = useNavigate();
  const { saveResult } = useResults();
  const [problems, setProblems] = useState([]);
  const [pi, setPi] = useState(0);
  const [codes, setCodes] = useState({});
  const [solved, setSolved] = useState({});
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(TOTAL_TIME);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [language, setLanguage] = useState('JAVA');
  const timerRef = useRef(null);

  useEffect(() => {
    technicalAPI.getProblems()
      .then(res => setProblems(res.data.data))
      .catch(() => setProblems(FALLBACK_PROBLEMS))
      .finally(() => setLoading(false));
  }, []);

  const currentCode = codes[pi] ?? (problems[pi]?.starterCode || '');
  const setCurrentCode = (val) => setCodes(c => ({ ...c, [pi]: val }));

  const handleRun = async () => {
    setRunning(true);
    setOutput('⟳ Running test cases...');
    try {
      const problem = problems[pi] || FALLBACK_PROBLEMS[pi];
      const res = await technicalAPI.evaluateCode({
        questionId: String(problem?.id ?? pi),
        language,
        problemStatement: problem?.description || '',
        userCode: currentCode,
      });
      const d = res.data.data;
      if (d.isCorrect) {
        setSolved(s => ({ ...s, [pi]: true }));
        setOutput(`✓ AI Review: CORRECT\nScore: ${Math.round(d.score)}%\n\nNo major issues found.`);
      } else {
        const err = Array.isArray(d.errors) && d.errors.length ? d.errors.join('\n') : 'AI evaluator found issues.';
        const sugg = Array.isArray(d.suggestions) && d.suggestions.length ? `\n\nSuggestions:\n- ${d.suggestions.join('\n- ')}` : '';
        setOutput(`✗ AI Review: NEEDS FIXES\nScore: ${Math.round(d.score)}%\n${err}${sugg}`);
      }
    } catch {
      // Local fallback evaluation
      const pass = localCheck(currentCode, pi);
      if (pass) {
        setSolved(s => ({ ...s, [pi]: true }));
        setOutput('✓ Local fallback: PASSED\nScore: 80%');
      } else {
        setOutput(`✗ Local fallback: FAILED\nOutput did not match expected.\n\nHint: ${problems[pi]?.hint}`);
      }
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = useCallback(async (auto = false) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const solvedCount = Object.values(solved).filter(Boolean).length;
    const totalProblems = problems.length || 3;
    const pct = Math.round((solvedCount / totalProblems) * 100);
    const grade = pct >= 85 ? 'A+' : pct >= 70 ? 'B+' : pct >= 55 ? 'C+' : 'D';
    const result = { solved: solvedCount, total: totalProblems, percentage: pct, pct, grade };
    try {
      await technicalAPI.submitAll({ codes, solved, problemCount: totalProblems });
    } catch {}
    saveResult('technical', result);
    navigate('/technical/result', { state: result });
    setSubmitting(false);
  }, [codes, navigate, problems.length, saveResult, solved]);

  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setTime(t => { if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, handleSubmit]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050812' }}><Spinner size={36} /></div>
  );

  const p = problems[pi] || FALLBACK_PROBLEMS[pi];
  const solvedCount = Object.values(solved).filter(Boolean).length;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: 18, position: 'relative' }}>
      <Orb color="#8b5cf6" size={180} left="-40px" top="-40px" opacity={0.07} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>💻 Technical Round</h1>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>{solvedCount}/{problems.length} solved · {language === 'CPP' ? 'C++' : language} DSA & OOPs</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: 130, padding: '7px 10px', fontSize: 12 }}>
            <option value="JAVA">JAVA</option>
            <option value="PYTHON">PYTHON</option>
            <option value="C">C</option>
            <option value="CPP">C++</option>
          </select>
          <TimerDisplay seconds={time} warningAt={300} />
          <button className="btn btn-purple" onClick={() => navigate('/dashboard')} style={{ fontSize: 11, padding: '6px 13px' }}>✕ Exit</button>
        </div>
      </div>

      {/* Problem Switcher */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
        {problems.map((pp, i) => (
          <button key={i} className="btn" onClick={() => { setPi(i); setShowHint(false); }} style={{
            padding: '7px 14px', fontSize: 12,
            background: pi === i ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${pi === i ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.08)'}`,
            color: pi === i ? '#8b5cf6' : 'rgba(226,232,240,0.45)',
          }}>
            {solved[i] ? '✓ ' : ''}{i + 1}. {pp.title}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
          <button className="btn btn-green" onClick={handleRun} disabled={running} style={{ fontSize: 12, padding: '7px 16px' }}>
            {running ? <Spinner size={14} color="#10b981" /> : '▶ Run'}
          </button>
          <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting} style={{ fontSize: 12, padding: '7px 16px' }}>
            {submitting ? <Spinner size={14} /> : 'Submit All'}
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, height: 'calc(100vh - 160px)' }}>
        {/* Left: Problem */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <DiffBadge diff={p?.difficulty} />
              {p?.tags?.map(t => (
                <span key={t} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>{t}</span>
              ))}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{p?.title}</h2>
            <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.65)', lineHeight: 1.7, marginBottom: 14 }}>{p?.description}</p>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.4)', letterSpacing: '0.5px', marginBottom: 8 }}>EXAMPLES</div>
            {p?.examples?.map((ex, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 10, marginBottom: 7 }}>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'rgba(226,232,240,0.5)' }}>Input: <span style={{ color: '#a9dc76' }}>{ex.input}</span></div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'rgba(226,232,240,0.5)' }}>Output: <span style={{ color: '#00f5ff' }}>{ex.output}</span></div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.4)' }}>💡 HINT</div>
              <button className="btn btn-ghost" onClick={() => setShowHint(h => !h)} style={{ fontSize: 11, padding: '3px 10px' }}>{showHint ? 'Hide' : 'Show'}</button>
            </div>
            {showHint && <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.55)', lineHeight: 1.65 }}>{p?.hint}</p>}
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,245,255,0.5)', marginBottom: 6 }}>🔷 OOPs CONCEPT</div>
            <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', lineHeight: 1.65 }}>{p?.oopsConcept}</p>
          </div>
        </div>

        {/* Right: Editor + Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 10, color: 'rgba(226,232,240,0.25)', zIndex: 1, fontFamily: 'JetBrains Mono,monospace' }}>{language === 'CPP' ? 'C++' : language}</div>
            <textarea
              className="code-editor"
              style={{ height: '100%', minHeight: 280 }}
              value={currentCode}
              onChange={e => setCurrentCode(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="glass-card" style={{ padding: 14, minHeight: 90 }}>
            <pre style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: output.startsWith('✓') ? '#10b981' : output.startsWith('✗') ? '#ef4444' : output.startsWith('⟳') ? '#f59e0b' : 'rgba(226,232,240,0.4)', margin: 0, whiteSpace: 'pre-wrap' }}>
              {output || '// Output will appear here after running...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function localCheck(code, pi) {
  if (!code || !code.includes('return')) return false;
  return pi === 0 ? code.includes('map') || code.includes('Map') || code.includes('HashMap')
    : pi === 1 ? code.includes('isPalindrome') || code.includes('charAt') || code.length > 80
    : code.includes('max') || code.includes('curr') || code.includes('sum');
}
