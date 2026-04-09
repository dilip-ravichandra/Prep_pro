import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { GlassCard, Orb, StatCard, ProgressBar, SectionHeader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useResults } from '../context/ResultsContext';

const ROUNDS = [
  { id: 'aptitude',  icon: '🧠', color: '#00f5ff', title: 'Aptitude Round',    detail: '10 MCQ · 15 min',  sub: 'Logic · Math · Verbal' },
  { id: 'technical', icon: '💻', color: '#8b5cf6', title: 'Technical Round',   detail: '3 Problems · 60 min', sub: 'Java DSA & OOPs' },
  { id: 'behavioral',icon: '🎬', color: '#ec4899', title: 'Behavioral Round',  detail: '6 Questions · 30 min',sub: 'HR Interview + AI Scoring' },
];

const TIPS = [
  'Max 90 sec per aptitude question — flag difficult ones and return later.',
  'Always explain your approach out loud before writing code in technical rounds.',
  'Use the STAR method for behavioral: Situation → Task → Action → Result.',
  'Strong posture and clear speech significantly boost your behavioral scores.',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { results, completedCount, overallScore } = useResults();

  const firstName = (user?.name || '').split(' ')[0];

  const completedMsg =
    completedCount === 3 ? 'All rounds complete! View your analytics.' :
    completedCount === 0 ? 'Start your first practice round below.' :
    `${completedCount} of 3 rounds completed. Keep going!`;

  return (
    <DashboardLayout>
      <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Orb color="#00f5ff" size={220} left="-60px" top="-50px" opacity={0.06} />
        <Orb color="#8b5cf6" size={180} left="72%" top="180px" opacity={0.05} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              Hey, <span className="gradient-text">{firstName}</span> 👋
            </h1>
            <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 12 }}>{completedMsg}</p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
            <StatCard icon="⚡" label="ROUNDS DONE"  value={`${completedCount}/3`} sub="Complete all 3" color="#00f5ff" />
            <StatCard icon="🎯" label="AVG SCORE"    value={completedCount > 0 ? `${overallScore}%` : '—'} sub="Across rounds" color="#8b5cf6" />
            <StatCard icon="🏆" label="YOUR RANK"    value="#7" sub="Among 10K+ students" color="#f59e0b" />
            <StatCard icon="🔥" label="STREAK"       value="4d" sub="Keep it going!" color="#10b981" />
          </div>

          {/* Round Cards */}
          <SectionHeader title="" subtitle="" />
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 13, color: 'rgba(226,232,240,0.7)' }}>Practice Rounds</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 26 }}>
            {ROUNDS.map(({ id, icon, color, title, detail, sub }) => {
              const res = results[id];
              return (
                <GlassCard
                  key={id}
                  onClick={() => navigate(`/${id}`)}
                  style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  {/* top accent line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
                    <div style={{ background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 10, padding: 11, fontSize: 20 }}>
                      {icon}
                    </div>
                    {res ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 19, fontWeight: 700, color }}>{res.percentage || res.pct}%</div>
                        <div style={{ fontSize: 10, color: '#10b981' }}>✓ Completed</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, padding: '3px 9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, color: 'rgba(226,232,240,0.4)' }}>
                        Not started
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', marginBottom: 2 }}>{detail}</div>
                  <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.3)', marginBottom: 14 }}>{sub}</div>

                  {res && (
                    <div style={{ marginBottom: 12 }}>
                      <ProgressBar pct={res.percentage || res.pct} color={color} />
                    </div>
                  )}

                  <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8, padding: '8px 12px', fontSize: 12, color, textAlign: 'center', fontWeight: 600 }}>
                    {res ? 'Retake Round →' : 'Start Round →'}
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Quick Tips */}
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 11, color: 'rgba(226,232,240,0.7)' }}>💡 Quick Tips</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
            {TIPS.map((tip, i) => (
              <GlassCard key={i} style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 10, color: '#00f5ff', fontWeight: 700, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.5)', lineHeight: 1.6 }}>{tip}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
