import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Orb } from '../components/UI';

const BREAK_SECONDS = 60;
const SKIP_LOCK_SECONDS = 12;

export default function BreakScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const nextPath = location.state?.nextPath || '/technical';
  const nextRoundLabel = location.state?.nextRoundLabel || 'Technical Round';
  const previousRoundLabel = location.state?.previousRoundLabel || 'Previous Round';
  const previousScore = typeof location.state?.previousScore === 'number'
    ? location.state.previousScore
    : null;

  const [secondsLeft, setSecondsLeft] = useState(BREAK_SECONDS);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          navigate(nextPath, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigate, nextPath]);

  const canSkip = useMemo(() => secondsLeft <= (BREAK_SECONDS - SKIP_LOCK_SECONDS), [secondsLeft]);
  const lockSecondsLeft = useMemo(
    () => Math.max(0, secondsLeft - (BREAK_SECONDS - SKIP_LOCK_SECONDS)),
    [secondsLeft]
  );
  const progress = useMemo(
    () => Math.round(((BREAK_SECONDS - secondsLeft) / BREAK_SECONDS) * 100),
    [secondsLeft]
  );

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <Orb color="#00f5ff" size={220} left="-70px" top="-70px" opacity={0.07} />
      <Orb color="#8b5cf6" size={180} left="80%" top="15%" opacity={0.07} />

      <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 80, position: 'relative', zIndex: 1 }}>
        <div className="glass-card animate-fadeUp" style={{ padding: 30, textAlign: 'center' }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }} className="gradient-text">
            Next Round Starting Soon...
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.55)', marginBottom: 14 }}>
            Take a short break
          </p>

          {previousScore !== null && (
            <div style={{ marginBottom: 14, fontSize: 13, color: 'rgba(226,232,240,0.7)' }}>
              {previousRoundLabel} score: <strong style={{ color: '#10b981' }}>{Math.round(previousScore)}%</strong>
            </div>
          )}

          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 70, fontWeight: 800, lineHeight: 1, margin: '10px 0 18px', color: '#00f5ff' }}>
            {secondsLeft}s
          </div>

          <div style={{ width: '100%', height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 18 }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg,#00f5ff,#8b5cf6)',
                transition: 'width 0.8s linear',
              }}
            />
          </div>

          <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.7)', marginBottom: 10 }}>
            You're doing great!
          </p>
          <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.45)', marginBottom: 22 }}>
            Prepare for {nextRoundLabel}
          </p>

          <button
            className="btn btn-primary"
            onClick={() => navigate(nextPath, { replace: true })}
            disabled={!canSkip}
            style={{ minWidth: 170 }}
          >
            {canSkip ? 'Skip Now' : `Skip in ${lockSecondsLeft}s`}
          </button>
        </div>
      </div>
    </div>
  );
}
