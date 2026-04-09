import React, { useState, useEffect, useMemo } from 'react';
import { Orb, GlassCard, Spinner } from '../components/UI';
import { adminAPI } from '../api/client';

export default function AdminLeaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('total'); // total, aptitude, technical, behavioral
  const [filterCollege, setFilterCollege] = useState('');

  const colleges = useMemo(() => {
    const cols = new Set(students.map(s => s.college).filter(Boolean));
    return Array.from(cols).sort();
  }, [students]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getStudentLeaderboard();
      setStudents(response.data?.data || []);
    } catch (err) {
      setError('Failed to load leaderboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students
    .filter(s => !filterCollege || s.college === filterCollege)
    .sort((a, b) => {
      const scores = {
        total: (s) => (s.aptitudeScore || 0) + (s.technicalScore || 0) + (s.behavioralScore || 0),
        aptitude: (s) => s.aptitudeScore || 0,
        technical: (s) => s.technicalScore || 0,
        behavioral: (s) => s.behavioralScore || 0,
      };
      return scores[sortBy](b) - scores[sortBy](a);
    });

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;

  return (
    <div className="grid-bg" style={{ padding: 28, minHeight: '100vh', position: 'relative' }}>
      <Orb color="#fbbf24" size={200} left="-80px" top="-60px" opacity={0.08} />

      <h1 className="gradient-text-warm" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        📊 Student Leaderboard
      </h1>
      <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: 13, marginBottom: 20 }}>
        Monitor performance across all assessment rounds
      </p>

      {error && (
        <GlassCard style={{ padding: 14, marginBottom: 14, background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444' }}>
          <p style={{ color: '#fca5a5', fontSize: 12 }}>{error}</p>
        </GlassCard>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <GlassCard style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.5)', marginBottom: 4 }}>TOTAL STUDENTS</div>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 24, color: '#fbbf24', fontWeight: 700 }}>{students.length}</div>
        </GlassCard>
        <GlassCard style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.5)', marginBottom: 4 }}>AVG TOTAL</div>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 24, color: '#00f5ff', fontWeight: 700 }}>
            {students.length ? Math.round(students.reduce((s, st) => s + (st.aptitudeScore || 0) + (st.technicalScore || 0) + (st.behavioralScore || 0), 0) / students.length) : 0}
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <option value="total">Total Score</option>
            <option value="aptitude">Aptitude</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>College:</label>
          <select
            value={filterCollege}
            onChange={(e) => setFilterCollege(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <option value="">All Colleges</option>
            {colleges.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <button
          onClick={loadLeaderboard}
          style={{
            marginLeft: 'auto',
            padding: '6px 14px',
            borderRadius: 6,
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.3)',
            color: '#fbbf24',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </GlassCard>

      {/* Leaderboard Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(251,191,36,0.08)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#fbbf24' }}>Rank</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#fbbf24' }}>Name</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#fbbf24' }}>Email</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#00f5ff' }}>Aptitude</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#8b5cf6' }}>Technical</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#10b981' }}>Behavioral</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#fbbf24' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: 'center', color: 'rgba(226,232,240,0.35)' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                filtered.map((student, idx) => {
                  const total = (student.aptitudeScore || 0) + (student.technicalScore || 0) + (student.behavioralScore || 0);
                  return (
                    <tr key={student.id || student._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#fbbf24' }}>#{idx + 1}</td>
                      <td style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 500 }}>{student.name}</td>
                      <td style={{ padding: '12px 14px', color: 'rgba(226,232,240,0.65)', fontSize: 11 }}>{student.email}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#00f5ff' }}>{student.aptitudeScore || '-'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#8b5cf6' }}>{student.technicalScore || '-'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#10b981' }}>{student.behavioralScore || '-'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#fbbf24' }}>{total}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
