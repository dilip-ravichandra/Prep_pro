// ═══════════════════════════════════════════════════════════
//  BEHAVIORAL ROUND
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { behavioralAPI, leaderboardAPI, userAPI } from '../api/client';
import { useResults } from '../context/ResultsContext';
import { Orb, ProgressBar, ProgressDots, Spinner } from '../components/UI';

const BQ = [
  "Tell me about yourself and what drives you toward this role.",
  "Describe a challenging technical project. What was your approach and outcome?",
  "Where do you see yourself professionally in 5 years?",
  "Tell me about a conflict with a team member and how you resolved it.",
  "What are your strongest technical skills and what areas are you actively improving?",
  "Why should we hire you over other qualified candidates?",
];

export function BehavioralRound() {
  const navigate = useNavigate();
  const { saveResult } = useResults();
  const [qi, setQi] = useState(0);
  const [recorded, setRecorded] = useState({});
  const [recTime, setRecTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const recRef = useRef(null);

  const startRec = () => {
    if (recorded[qi]) return;
    setRecTime(0);
    setIsRecording(true);
    recRef.current = setInterval(() => {
      setRecTime(t => {
        if (t >= 119) { stopRec(t + 1); return t + 1; }
        return t + 1;
      });
    }, 1000);
  };

  const stopRec = (dur) => {
    if (recRef.current) { clearInterval(recRef.current); recRef.current = null; }
    setIsRecording(false);
    const d = dur || recTime;
    setAnalyzing(true);
    setTimeout(() => {
      const score = Math.floor(65 + Math.random() * 30);
      const conf = d >= 60 && d <= 90 ? Math.floor(82 + Math.random() * 15) : Math.floor(55 + Math.random() * 25);
      const clarity = Math.floor(62 + Math.random() * 33);
      setRecorded(r => ({ ...r, [qi]: { duration: d, score, confidence: conf, clarity } }));
      setAnalyzing(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const responses = Object.entries(recorded).map(([idx, r]) => ({
      questionIndex: parseInt(idx), durationSeconds: r.duration, answered: true,
    }));
    const avg = responses.length ? Math.round(Object.values(recorded).reduce((a, r) => a + r.score, 0) / responses.length) : 0;
    const result = { percentage: avg, pct: avg, answered: responses.length, total: BQ.length, grade: avg >= 85 ? 'A+' : avg >= 70 ? 'B+' : avg >= 55 ? 'C+' : 'D' };
    try { await behavioralAPI.submit({ responses, totalTimeTakenSeconds: 0 }); } catch {}
    saveResult('behavioral', result);
    navigate('/behavioral/result', { state: result });
    setSubmitting(false);
  };

  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const rec = recorded[qi];

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: 22, position: 'relative', overflow: 'hidden' }}>
      <Orb color="#ec4899" size={200} left="-50px" top="-50px" opacity={0.07} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#ec4899,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎬 Behavioral Round</h1>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>HR Interview Simulation · AI Feedback</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProgressDots total={BQ.length} current={qi} answered={recorded} color="#ec4899" />
          <button className="btn btn-purple" onClick={() => navigate('/dashboard')} style={{ fontSize: 11, padding: '6px 13px' }}>✕ Exit</button>
        </div>
      </div>
      <div style={{ marginBottom: 18 }}><ProgressBar pct={(qi / BQ.length) * 100} color="linear-gradient(90deg,#ec4899,#f59e0b)" /></div>

      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div className="glass-card animate-fadeUp" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>Question {qi + 1} of {BQ.length}</span>
            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="rec-dot" />
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>REC</span>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: '#ef4444' }}>{fmt(recTime)}</span>
                <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)' }}>/ 02:00</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.65, color: '#e2e8f0', marginBottom: 18 }}>{BQ[qi]}</p>

          {/* Camera Preview */}
          <div style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${isRecording ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(0,245,255,0.03),transparent)' }} />
            {analyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Spinner size={28} />
                <div style={{ fontSize: 12, color: '#00f5ff' }}>Analyzing your response...</div>
              </div>
            ) : rec ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Response Recorded</div>
                <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginTop: 3 }}>Duration: {fmt(rec.duration)}</div>
              </div>
            ) : isRecording ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 36 }}>🎤</div>
                <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)' }}>Recording in progress...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 36 }}>📹</div>
                <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)' }}>Press Record to start your answer</div>
              </div>
            )}
          </div>

          {/* Score Cards after recording */}
          {rec && !analyzing && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 12 }}>
                {[['Overall', rec.score, '#00f5ff'], ['Confidence', rec.confidence, '#8b5cf6'], ['Clarity', rec.clarity, '#10b981']].map(([l, v, c]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: 11, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginBottom: 5 }}>{l}</div>
                    <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 700, color: c }}>{v}%</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: 10, lineHeight: 1.6, marginBottom: 14 }}>
                💡 <strong style={{ color: '#00f5ff' }}>AI Tip:</strong> {rec.score >= 80 ? 'Excellent! Great pace and clear structure.' : rec.score >= 65 ? 'Good start. Use STAR method for stronger impact.' : 'Add specific examples. Lead with the situation clearly.'}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {!rec && !isRecording && <button className="btn btn-red" onClick={startRec} style={{ fontSize: 13 }}>🔴 Start Recording</button>}
            {isRecording && <button className="btn btn-red" onClick={() => stopRec()} style={{ fontSize: 13 }}>⏹ Stop Recording</button>}
            {rec && !isRecording && !analyzing && <button className="btn btn-cyan" onClick={() => setRecorded(r => { const n = {...r}; delete n[qi]; return n; })} style={{ fontSize: 13 }}>🔄 Re-record</button>}
            {!rec && !isRecording && <button className="btn btn-ghost" onClick={() => qi < BQ.length - 1 ? setQi(q => q + 1) : handleSubmit()} style={{ fontSize: 13 }}>Skip</button>}
            {rec && !analyzing && (
              qi < BQ.length - 1
                ? <button className="btn btn-primary" onClick={() => setQi(q => q + 1)} style={{ fontSize: 13 }}>Next →</button>
                : <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ fontSize: 13 }}>{submitting ? <Spinner size={14} /> : 'Finish Round'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  RESULT PAGE (shared for all 3 rounds)
// ═══════════════════════════════════════════════════════════
export function ResultPage({ type }) {
  const navigate = useNavigate();
  const { results, clearResult } = useResults();
  const res = results[type];

  if (!res) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050812' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>You haven't taken this round yet.</h2>
        <button className="btn btn-primary" onClick={() => navigate(`/${type}`)} style={{ marginTop: 12 }}>Start {type.charAt(0).toUpperCase() + type.slice(1)} Round →</button>
      </div>
    </div>
  );

  const meta = {
    aptitude:  { ico: '🧠', color: '#00f5ff', label: 'Aptitude' },
    technical: { ico: '💻', color: '#8b5cf6', label: 'Technical' },
    behavioral:{ ico: '🎬', color: '#ec4899', label: 'Behavioral' },
  }[type];
  const pct = res.percentage || res.pct || 0;
  const grade = pct >= 85 ? 'A+' : pct >= 70 ? 'B+' : pct >= 55 ? 'C+' : 'D';
  const feedback = pct >= 85 ? 'Excellent! You are well prepared.' : pct >= 70 ? 'Good performance. Minor improvements needed.' : pct >= 55 ? 'Average. Focus on weak areas.' : 'Needs improvement. Revisit core concepts.';

  const bars = type === 'aptitude'
    ? [['Logical', 78], ['Quantitative', 65], ['Verbal', 90], ['Pattern', pct]]
    : type === 'technical'
    ? [['Problem Solving', pct], ['Code Quality', 70], ['Efficiency', 60], ['Edge Cases', 55]]
    : [['Communication', pct], ['Confidence', 75], ['Clarity', 68], ['Structure', 72]];

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: 28, position: 'relative', overflow: 'hidden' }}>
      <Orb color={meta.color} size={250} left="-60px" top="-60px" opacity={0.08} />
      <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <button className="btn btn-purple" onClick={() => navigate('/dashboard')} style={{ marginBottom: 20, fontSize: 12, padding: '7px 14px' }}>← Back to Dashboard</button>

        {/* Score Card */}
        <div className="glass-card animate-fadeUp" style={{ padding: 32, textAlign: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${meta.color},transparent)` }} />
          <div style={{ fontSize: 52, marginBottom: 12 }}>{meta.ico}</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, background: `linear-gradient(135deg,#e2e8f0,${meta.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {meta.label} Round Complete
          </h1>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 64, fontWeight: 900, color: meta.color, margin: '14px 0', textShadow: `0 0 30px ${meta.color}60` }}>{pct}%</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{grade}</div>
          <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.55)' }}>{feedback}</p>
        </div>

        {/* Performance Bars */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 14 }}>PERFORMANCE BREAKDOWN</div>
          {bars.map(([label, val]) => (
            <div key={label} style={{ marginBottom: 11 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'rgba(226,232,240,0.6)' }}>{label}</span>
                <span style={{ color: meta.color }}>{val}%</span>
              </div>
              <ProgressBar pct={val} color={meta.color} />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button className="btn btn-cyan" onClick={() => { clearResult(type); navigate(`/${type}`); }} style={{ flex: 1, padding: 12 }}>🔄 Retake</button>
          <button className="btn btn-primary" onClick={() => navigate('/analytics')} style={{ flex: 1, padding: 12 }}>📊 Analytics</button>
          <button className="btn btn-purple" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: 12 }}>🏠 Dashboard</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANALYTICS PAGE
// ═══════════════════════════════════════════════════════════
export function Analytics() {
  const { results, completedCount, overallScore } = useResults();
  const navigate = useNavigate();

  const skillBars = [
    ['Problem Solving', results.aptitude?.percentage || 0, '#00f5ff'],
    ['Coding', results.technical?.percentage || 0, '#8b5cf6'],
    ['Communication', results.behavioral?.percentage || 0, '#ec4899'],
    ['Time Management', 72, '#f59e0b'],
    ['Pattern Recognition', results.aptitude ? 68 : 0, '#10b981'],
  ];

  const recs = [
    { ico: '🧮', t: 'Strengthen Quantitative', d: 'Practice profit/loss and time-work problems. These appear in 60% of aptitude tests.', c: '#00f5ff', done: !!results.aptitude },
    { ico: '⌨️', t: 'Code Quality Over Speed', d: 'Recruiters evaluate readability, comments, and edge-case handling, not just correctness.', c: '#8b5cf6', done: !!results.technical },
    { ico: '🗣️', t: 'Use STAR Method', d: 'Structure behavioral answers: Situation → Task → Action → Result for maximum impact.', c: '#ec4899', done: !!results.behavioral },
    { ico: '⏱️', t: 'Improve Time Management', d: 'Spend max 90 sec per aptitude question. Flag and return to hard ones.', c: '#f59e0b', done: false },
  ];

  const circumference = 2 * Math.PI * 38;

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#3b82f6" size={220} left="-60px" top="-40px" opacity={0.07} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, background: 'linear-gradient(135deg,#e2e8f0,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics & Insights</h1>
        <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginBottom: 22 }}>{completedCount} of 3 rounds completed</p>

        {/* Overall Score */}
        <div className="glass-card" style={{ padding: 22, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="url(#pg)" strokeWidth="8" strokeDasharray={`${overallScore * circumference / 100} ${circumference}`} strokeLinecap="round" />
              <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#00f5ff" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 17, fontWeight: 700, color: '#00f5ff' }}>{overallScore}%</div>
              <div style={{ fontSize: 9, color: 'rgba(226,232,240,0.4)' }}>Overall</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Overall Performance</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['aptitude','technical','behavioral'].map((t, i) => {
                const r = results[t]; const cols = ['#00f5ff','#8b5cf6','#ec4899'];
                const labels = ['Aptitude','Technical','Behavioral'];
                return (
                  <div key={t} style={{ padding: '5px 11px', borderRadius: 20, background: r ? `${cols[i]}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${r ? cols[i]+'35' : 'rgba(255,255,255,0.08)'}`, fontSize: 11, color: r ? cols[i] : 'rgba(226,232,240,0.3)' }}>
                    {labels[i]}: {r ? `${r.percentage || r.pct}%` : '—'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skill Bars + Round Scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 14 }}>SKILL RADAR</div>
            {skillBars.map(([l, v, c]) => (
              <div key={l} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'rgba(226,232,240,0.6)' }}>{l}</span>
                  <span style={{ color: c, fontWeight: 600 }}>{v}%</span>
                </div>
                <ProgressBar pct={v} color={c} />
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 14 }}>ROUND SCORES</div>
            {['aptitude','technical','behavioral'].map((t, i) => {
              const r = results[t]; const cols = ['#00f5ff','#8b5cf6','#ec4899']; const labels = ['🧠 Aptitude','💻 Technical','🎬 Behavioral'];
              return (
                <div key={t} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{labels[i]}</div>
                    {r ? <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 16, fontWeight: 700, color: cols[i] }}>{r.percentage || r.pct}%</div>
                       : <button className="btn btn-ghost" onClick={() => navigate(`/${t}`)} style={{ fontSize: 11, padding: '4px 10px' }}>Start</button>}
                  </div>
                  <ProgressBar pct={r ? (r.percentage || r.pct) : 0} color={cols[i]} height={8} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 14 }}>🎯 PERSONALIZED RECOMMENDATIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {recs.map(({ ico, t, d, c, done }) => (
              <div key={t} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '12px 14px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${c}15`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>{ico}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', lineHeight: 1.55 }}>{d}</div>
                </div>
                {done && <span style={{ fontSize: 18 }}>✅</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  LEADERBOARD PAGE
// ═══════════════════════════════════════════════════════════
export function Leaderboard() {
  const { overallScore } = useResults();
  const { useAuth } = require('../context/AuthContext');
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await leaderboardAPI.get();
        setRows(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  const podium = rows.slice(0, 3);
  const podiumOrder = [1, 0, 2].map((idx) => podium[idx]).filter(Boolean);
  const me = rows.find((r) => r.userId && r.userId === user?.id);

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#f59e0b" size={200} left="-40px" top="-40px" opacity={0.07} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }} className="gradient-text-warm">🏆 Global Leaderboard</h1>
        <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginBottom: 22 }}>Rankings among all PrepPro students</p>

        {/* Podium */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {podiumOrder.map((u, i) => {
            const heights = ['140px','170px','120px'];
            const bgs = ['rgba(192,192,192,0.15)','rgba(255,215,0,0.15)','rgba(205,127,50,0.15)'];
            const bords = ['rgba(192,192,192,0.35)','rgba(255,215,0,0.45)','rgba(205,127,50,0.35)'];
            return (
              <div key={u.rank} style={{ background: bgs[i], border: `1px solid ${bords[i]}`, borderRadius: 14, padding: '16px 14px', textAlign: 'center', width: 140, height: heights[i], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <div style={{ fontSize: 22 }}>{u.badge || ['🥇','🥈','🥉'][i]}</div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{u.name[0]}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{u.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.45)' }}>{u.college}</div>
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: i === 1 ? 20 : 16, fontWeight: 700, color: '#f59e0b' }}>{u.score}%</div>
              </div>
            );
          })}
          {!loading && podiumOrder.length === 0 && (
            <div className="glass-card" style={{ padding: 16, fontSize: 12, color: 'rgba(226,232,240,0.5)' }}>
              No real leaderboard data yet. Complete a round to appear here.
            </div>
          )}
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '50px 1fr 120px 80px', gap: 10, fontSize: 11, color: 'rgba(226,232,240,0.35)', fontWeight: 600, letterSpacing: '0.5px' }}>
            <div>RANK</div><div>STUDENT</div><div>COLLEGE</div><div style={{ textAlign: 'right' }}>SCORE</div>
          </div>
          {loading && (
            <div style={{ padding: 18, textAlign: 'center' }}><Spinner text="Loading leaderboard..." /></div>
          )}
          {!loading && rows.map(u => (
            <div key={u.rank} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '50px 1fr 120px 80px', gap: 10, alignItems: 'center', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.025)'}
              onMouseOut={e => e.currentTarget.style.background='transparent'}
            >
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: u.rank <= 3 ? '#f59e0b' : 'rgba(226,232,240,0.4)' }}>#{u.rank}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00f5ff', flexShrink: 0 }}>{u.name[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.college}</div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: u.score >= 90 ? '#10b981' : u.score >= 80 ? '#00f5ff' : 'rgba(226,232,240,0.6)', textAlign: 'right' }}>{u.score}%</div>
            </div>
          ))}
          {!loading && rows.length === 0 && (
            <div style={{ padding: '14px 18px', fontSize: 12, color: 'rgba(226,232,240,0.45)' }}>
              No rankings available yet.
            </div>
          )}
          {!loading && overallScore > 0 && !me && (
            <div style={{ padding: '12px 18px', background: 'rgba(0,245,255,0.05)', borderTop: '1px solid rgba(0,245,255,0.15)', display: 'grid', gridTemplateColumns: '50px 1fr 120px 80px', gap: 10, alignItems: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#00f5ff' }}>#{rows.length + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00f5ff', flexShrink: 0 }}>{(user?.name || 'Y')[0]}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: '#00f5ff' }}>{user?.name || 'You'} (You)</div></div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>{user?.college || '—'}</div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: '#00f5ff', textAlign: 'right' }}>{overallScore}%</div>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(226,232,240,0.3)', marginTop: 14 }}>Complete all 3 rounds to climb the leaderboard</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PROFILE PAGE
// ═══════════════════════════════════════════════════════════
export function Profile() {
  const { user, logout } = require('../context/AuthContext').useAuth();
  const { results, overallScore, completedCount } = useResults();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resumeInfo, setResumeInfo] = useState({ hasResume: false, fileName: null });
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [resumeSuccess, setResumeSuccess] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);

  const skills = ['Python','Java','C++','SQL','JavaScript','React','HTML/CSS','Machine Learning','Deep Learning','Random Forest','LSTM','n8n','MySQL','Git','GitHub','FlutterFlow'];

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await userAPI.getResume();
        if (res?.data?.success && res?.data?.data) {
          setResumeInfo(res.data.data);
        }
      } catch {
        setResumeInfo({ hasResume: false, fileName: null });
      }
    };
    fetchResume();
  }, []);

  const onResumeChange = (e) => {
    const file = e.target.files?.[0];
    setResumeError('');
    setResumeSuccess('');
    if (!file) {
      setSelectedResume(null);
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExt = ['.pdf', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    const hasAllowedExt = allowedExt.some(ext => lowerName.endsWith(ext));

    if (file.size > 150 * 1024 * 1024) {
      setResumeError('File size must be 150MB or less.');
      setSelectedResume(null);
      return;
    }

    if (!allowedTypes.includes(file.type) && !hasAllowedExt) {
      setResumeError('Invalid file format. Upload PDF, DOC, or DOCX only.');
      setSelectedResume(null);
      return;
    }

    setSelectedResume(file);
  };

  const uploadResume = async () => {
    if (!selectedResume) {
      setResumeError('Please choose a valid resume file first.');
      return;
    }
    setResumeLoading(true);
    setResumeError('');
    setResumeSuccess('');
    try {
      const form = new FormData();
      form.append('file', selectedResume);
      const res = await userAPI.uploadResume(form);
      const data = res?.data?.data || { hasResume: true, fileName: selectedResume.name };
      setResumeInfo(data);
      setSelectedResume(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setResumeSuccess('Resume uploaded successfully.');
    } catch (err) {
      setResumeError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setResumeLoading(false);
    }
  };

  const fetchResumeBlob = async () => {
    const response = await userAPI.downloadResume();
    return new Blob([response.data], {
      type: response.headers?.['content-type'] || 'application/octet-stream',
    });
  };

  const viewResume = async () => {
    setResumeError('');
    try {
      const blob = await fetchResumeBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      setResumeError('Unable to open resume.');
    }
  };

  const downloadResume = async () => {
    setResumeError('');
    try {
      const blob = await fetchResumeBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeInfo?.fileName || 'resume';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      setResumeError('Unable to download resume.');
    }
  };

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#10b981" size={180} left="70%" top="-30px" opacity={0.07} />
      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, background: 'linear-gradient(135deg,#e2e8f0,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</h1>

        {/* Profile Card */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 14, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#00f5ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#050812', flexShrink: 0 }}>
            {(user?.name || '?')[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name || 'Student'}</h2>
            <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.5)', marginBottom: 3 }}>📧 {user?.email || '—'}</div>
            <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.5)', marginBottom: 10 }}>🏫 {user?.college || '—'}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-easy">4th Semester</span>
              <span className="badge badge-medium">CSE AI/ML</span>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' }}>Placement Ready</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#00f5ff,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{overallScore || '—'}</div>
            <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>Avg Score</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 11, marginBottom: 14 }}>
          {[['Rounds Done', `${completedCount}/3`, '#00f5ff'], ['Best Score', completedCount > 0 ? Math.max(...Object.values(results).filter(Boolean).map(r => r.percentage || r.pct || 0)) + '%' : '—', '#10b981'], ['Badges', '1/6', '#f59e0b'], ['Practice Days', '4', '#ec4899']].map(([l, v, c]) => (
            <div key={l} className="glass-card" style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginBottom: 5 }}>{l}</div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 12 }}>TECHNICAL SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {skills.map(s => (
              <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(226,232,240,0.6)' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Resume Upload */}
        <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 10 }}>UPLOAD RESUME</div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onResumeChange}
            style={{ marginBottom: 10, width: '100%', fontSize: 12, color: 'rgba(226,232,240,0.75)' }}
          />

          {(selectedResume || resumeInfo?.hasResume) && (
            <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.6)', marginBottom: 10 }}>
              File: {selectedResume?.name || resumeInfo?.fileName}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button className="btn btn-primary" onClick={uploadResume} disabled={resumeLoading || !selectedResume} style={{ padding: '7px 14px', fontSize: 12 }}>
              {resumeLoading ? <Spinner size={14} /> : (resumeInfo?.hasResume ? 'Replace Resume' : 'Upload Resume')}
            </button>

            {resumeInfo?.hasResume && (
              <>
                <button className="btn btn-ghost" onClick={viewResume} style={{ padding: '7px 14px', fontSize: 12 }}>View</button>
                <button className="btn btn-ghost" onClick={downloadResume} style={{ padding: '7px 14px', fontSize: 12 }}>Download</button>
                <button className="btn btn-purple" onClick={() => fileInputRef.current?.click()} style={{ padding: '7px 14px', fontSize: 12 }}>Replace Resume</button>
              </>
            )}
          </div>

          {resumeError && <div style={{ fontSize: 12, color: '#ef4444' }}>{resumeError}</div>}
          {resumeSuccess && <div style={{ fontSize: 12, color: '#10b981' }}>{resumeSuccess}</div>}
        </div>

        {/* Round History */}
        <div className="glass-card" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.45)', marginBottom: 12 }}>ROUND HISTORY</div>
          {['aptitude','technical','behavioral'].map((t, i) => {
            const r = results[t]; const cols = ['#00f5ff','#8b5cf6','#ec4899']; const labels = ['🧠 Aptitude','💻 Technical','🎬 Behavioral'];
            return (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{labels[i]}</div>
                {r ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 80 }}><ProgressBar pct={r.percentage || r.pct || 0} color={cols[i]} /></div>
                    <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 13, fontWeight: 700, color: cols[i], width: 40, textAlign: 'right' }}>{r.percentage || r.pct}%</div>
                  </div>
                ) : (
                  <button className="btn btn-ghost" onClick={() => navigate(`/${t}`)} style={{ fontSize: 11, padding: '5px 12px' }}>Start</button>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-red" onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', padding: 12 }}>🚪 Sign Out</button>
      </div>
    </div>
  );
}
