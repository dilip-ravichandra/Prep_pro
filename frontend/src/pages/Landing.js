import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Orb } from '../components/UI';

const FEATURES = [
  { icon: '🧠', title: 'Aptitude Round',    color: '#00f5ff', desc: 'Timed MCQ on logical reasoning, quantitative aptitude, and verbal ability. Instant feedback.' },
  { icon: '💻', title: 'Technical Round',   color: '#8b5cf6', desc: 'Solve real Java DSA problems in an integrated editor with test case runner and smart hints.' },
  { icon: '🎬', title: 'Behavioral Round',  color: '#ec4899', desc: 'HR interview simulation with recording and AI confidence, clarity, and communication scoring.' },
  { icon: '📊', title: 'Smart Analytics',   color: '#3b82f6', desc: 'Skill radar, round breakdowns, and personalized improvement recommendations after every attempt.' },
  { icon: '🏆', title: 'Live Leaderboard',  color: '#f59e0b', desc: 'Compare yourself with students across 100+ colleges and track your national ranking.' },
  { icon: '🔷', title: 'OOPs Architecture', color: '#10b981', desc: 'Backend built with Java Spring Boot showcasing all 4 OOPs pillars, secured with JWT + MongoDB.' },
];

const STATS = [
  ['10K+', 'Students'],
  ['500+', 'Questions'],
  ['3', 'Mock Rounds'],
  ['95%', 'Success Rate'],
];

const STEPS = [
  ['01', 'Register', 'Create your profile with your college and target company details.'],
  ['02', 'Practice Rounds', 'Complete aptitude, technical, and behavioral rounds at your own pace.'],
  ['03', 'Get AI Feedback', 'Receive detailed analytics, weak-area detection, and improvement tips.'],
  ['04', 'Land the Job', 'Build confidence through practice and ace your real placement interviews.'],
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050812 0%,#0d0f24 50%,#07091a 100%)' }}>

      {/* ─── Navbar ─── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 48px',
        background: 'rgba(5,8,18,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 700 }} className="gradient-text">
          PrepPro
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-purple" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="grid-bg" style={{
        position: 'relative', padding: '88px 48px 70px',
        textAlign: 'center', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <Orb color="#00f5ff" size={380} left="-80px" top="-70px" opacity={0.1} />
        <Orb color="#8b5cf6" size={320} left="62%" top="-20px" opacity={0.08} />
        <Orb color="#3b82f6" size={200} left="25%" top="55%" opacity={0.06} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 16px',
            background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: 20, fontSize: 11, color: '#00f5ff',
            marginBottom: 22, fontWeight: 600, letterSpacing: '1px',
          }}>
            ⚡ FULL 3-ROUND MOCK INTERVIEW PLATFORM
          </div>

          <h1 className="animate-float" style={{
            fontFamily: 'Orbitron,sans-serif',
            fontSize: 'clamp(28px,6vw,64px)',
            fontWeight: 900, lineHeight: 1.15,
            marginBottom: 20,
          }}>
            <span style={{ background: 'linear-gradient(135deg,#e2e8f0,#a0aec0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ace Every
            </span>
            <br />
            <span className="gradient-text">Interview Round</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(226,232,240,0.55)', maxWidth: 500, margin: '0 auto 34px', lineHeight: 1.7 }}>
            Practice aptitude, technical coding, and behavioral rounds with AI-powered feedback. Built for campus placement preparation.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 36px', fontSize: 15 }}>
              Start Free Practice →
            </button>
            <button className="btn btn-cyan" onClick={() => navigate('/login')} style={{ padding: '14px 36px', fontSize: 15 }}>
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 52, flexWrap: 'wrap' }}>
            {STATS.map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 26, fontWeight: 700, color: '#00f5ff' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: '70px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center', fontFamily: 'Orbitron,sans-serif',
          fontSize: 24, fontWeight: 700, marginBottom: 10,
        }} className="gradient-text">Complete Interview Preparation</h2>
        <p style={{ textAlign: 'center', color: 'rgba(226,232,240,0.4)', marginBottom: 44, fontSize: 13 }}>
          Everything you need from first shortlist to final offer
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          {FEATURES.map(({ icon, title, color, desc }) => (
            <div key={title} className="glass-card animate-fadeUp" style={{ padding: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: `${color}12`, border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 13, fontSize: 20,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section style={{ padding: '56px 48px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <h2 style={{
          textAlign: 'center', fontFamily: 'Orbitron,sans-serif',
          fontSize: 22, fontWeight: 700, marginBottom: 44,
        }} className="gradient-text">How It Works</h2>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 28 }}>
          {STEPS.map(([num, title, desc]) => (
            <div key={num} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 38, fontWeight: 900, color: 'rgba(0,245,255,0.12)', marginBottom: 10 }}>{num}</div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#00f5ff', marginBottom: 7 }}>{title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ textAlign: 'center', padding: '68px 40px', position: 'relative', overflow: 'hidden' }}>
        <Orb color="#8b5cf6" size={300} left="40%" top="0" opacity={0.1} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 12 }} className="gradient-text">
            Ready to Ace Your Interviews?
          </h2>
          <p style={{ color: 'rgba(226,232,240,0.45)', marginBottom: 28, fontSize: 13 }}>
            Join 10,000+ students who improved their placement performance.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 44px', fontSize: 15 }}>
            Start Free Today →
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'rgba(226,232,240,0.25)', fontSize: 11, flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontFamily: 'Orbitron,sans-serif', fontWeight: 700 }} className="gradient-text">PrepPro</span>
        <span>Java Spring Boot + MongoDB + React | OOPs: Inheritance · Encapsulation · Polymorphism · Abstraction</span>
        <span>© 2025 PrepPro</span>
      </footer>
    </div>
  );
}
