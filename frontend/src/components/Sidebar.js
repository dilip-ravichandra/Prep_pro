import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResults } from '../context/ResultsContext';

const NAV_ITEMS = [
  { path: '/dashboard',  icon: '🏠', label: 'Dashboard' },
  { path: '/aptitude',   icon: '🧠', label: 'Aptitude' },
  { path: '/technical',  icon: '💻', label: 'Technical' },
  { path: '/behavioral', icon: '🎬', label: 'Behavioral' },
  { path: '/analytics',  icon: '📊', label: 'Analytics' },
  { path: '/leaderboard',icon: '🏆', label: 'Leaderboard' },
  { path: '/profile',    icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { completedCount } = useResults();

  const W = collapsed ? 64 : 218;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: W,
      background: 'rgba(5,8,18,0.97)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      padding: '18px 10px',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Logo + Collapse Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        marginBottom: 22,
        padding: '0 2px',
      }}>
        {!collapsed && (
          <div style={{
            fontFamily: 'Orbitron,sans-serif',
            fontSize: 14, fontWeight: 700,
            background: 'linear-gradient(135deg,#00f5ff,#8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            ISPro
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '5px 8px',
            cursor: 'pointer', color: 'rgba(226,232,240,0.4)',
            flexShrink: 0, fontSize: 13, lineHeight: 1,
          }}
        >
          ☰
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ path, icon, label }) => {
          const active = location.pathname === path
            || (path !== '/dashboard' && location.pathname.startsWith(path));
          return (
            <div
              key={path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(path)}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              title={collapsed ? label : undefined}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
              {!collapsed && label === 'Dashboard' && completedCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10, fontWeight: 700,
                  background: 'rgba(0,245,255,0.15)',
                  color: '#00f5ff', padding: '2px 7px',
                  borderRadius: 20,
                }}>
                  {completedCount}/3
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />

      {/* User Info */}
      {!collapsed && user && (
        <div style={{ padding: '6px 4px', marginBottom: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.college}
          </div>
        </div>
      )}

      {/* Logout */}
      <div
        className="nav-item"
        onClick={handleLogout}
        style={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: 'rgba(239,68,68,0.65)',
          marginTop: 2,
        }}
        title={collapsed ? 'Logout' : undefined}
      >
        <span style={{ fontSize: 14 }}>🚪</span>
        {!collapsed && <span>Logout</span>}
      </div>
    </aside>
  );
}
