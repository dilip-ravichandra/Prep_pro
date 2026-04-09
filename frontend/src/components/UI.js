import React from 'react';

// ─── Glass Card ───────────────────────────────────────────────
export function GlassCard({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Orb (background glow decoration) ────────────────────────
export function Orb({ color, size, left, top, opacity = 0.1 }) {
  return (
    <div
      className="orb glow"
      style={{
        background: color,
        width: size,
        height: size,
        left,
        top,
        opacity,
      }}
    />
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
export function ProgressBar({ pct, color, height = 4 }) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div
        className="progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color || undefined,
        }}
      />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ label, variant = 'easy', style = {} }) {
  return (
    <span className={`badge badge-${variant}`} style={style}>
      {label}
    </span>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────
export function DiffBadge({ diff }) {
  const v = diff?.toLowerCase() === 'easy' ? 'easy'
    : diff?.toLowerCase() === 'medium' ? 'medium' : 'hard';
  return <Badge label={diff} variant={v} />;
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 28, color = '#00f5ff' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.9s linear infinite',
    }} />
  );
}

// ─── Timer Display ────────────────────────────────────────────
export function TimerDisplay({ seconds, warningAt = 60 }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const isLow = seconds < warningAt;
  return (
    <span style={{
      fontFamily: 'Orbitron, sans-serif',
      fontSize: 18,
      fontWeight: 700,
      color: isLow ? '#ef4444' : '#00f5ff',
      textShadow: `0 0 12px ${isLow ? 'rgba(239,68,68,0.6)' : 'rgba(0,245,255,0.6)'}`,
    }}>
      ⏱ {mins}:{secs}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, subtitle, gradientFrom = '#e2e8f0', gradientTo = '#8b5cf6' }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, marginBottom: 4,
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)' }}>{subtitle}</p>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = '#00f5ff' }) {
  return (
    <GlassCard className="stat-card" style={{ '--accent': color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginBottom: 6, letterSpacing: '0.5px' }}>{label}</div>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 20, fontWeight: 700, color }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          background: `${color}15`, border: `1px solid ${color}30`,
          borderRadius: 10, padding: 10, fontSize: 18, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Round Progress Dots ──────────────────────────────────────
export function ProgressDots({ total, current, answered = {}, color = '#00f5ff' }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: answered[i] != null
            ? color
            : i === current
            ? `${color}60`
            : 'rgba(255,255,255,0.12)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.45)', marginBottom: 20 }}>{subtitle}</p>}
      {action && (
        <button className="btn btn-primary" onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

// ─── Round Result Summary Card (compact) ─────────────────────
export function RoundSummaryChip({ type, result }) {
  const meta = {
    aptitude:  { ico: '🧠', color: '#00f5ff', label: 'Aptitude' },
    technical: { ico: '💻', color: '#8b5cf6', label: 'Technical' },
    behavioral:{ ico: '🎬', color: '#ec4899', label: 'Behavioral' },
  }[type];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 14px',
      background: result ? `${meta.color}10` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${result ? meta.color + '30' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 16 }}>{meta.ico}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)' }}>
          {result ? `${result.percentage || result.pct}%` : 'Not started'}
        </div>
      </div>
    </div>
  );
}
