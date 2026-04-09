import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV_ITEMS = [
  { path: '/admin-dashboard',  icon: '📊', label: 'Dashboard', desc: 'Leaderboard' },
  { path: '/admin/aptitude',   icon: '📝', label: 'Aptitude', desc: 'MCQ Questions' },
  { path: '/admin/technical',  icon: '💻', label: 'Technical', desc: 'Coding Questions' },
  { path: '/admin/behavioral', icon: '🎬', label: 'Behavioral', desc: 'Videos & Feedback' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const W = collapsed ? 64 : 240;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: W,
      background: 'rgba(5,8,18,0.98)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,165,0,0.1)',
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
            background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            ADMIN
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

      {/* Admin Badge */}
      {!collapsed && (
        <div style={{
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 8,
          padding: '8px 10px',
          marginBottom: 14,
          fontSize: 11,
          color: '#fbbf24',
          textAlign: 'center',
          fontWeight: 600,
        }}>
          ADMIN PANEL
        </div>
      )}

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {ADMIN_NAV_ITEMS.map(({ path, icon, label, desc }) => {
          const active = location.pathname === path
            || (path !== '/admin-dashboard' && location.pathname.startsWith(path));
          return (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
                background: active ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.02)',
                border: active ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.05)',
                color: active ? '#fbbf24' : 'rgba(226,232,240,0.6)',
              }}
              title={collapsed ? label : undefined}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              {!collapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.35)' }}>{desc}</div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />

      {/* User Info */}
      {!collapsed && user && (
        <div style={{ padding: '8px 4px', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24' }}>Admin</div>
          <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(226,232,240,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
        </div>
      )}

      {/* Logout */}
      <div
        onClick={handleLogout}
        style={{
          padding: collapsed ? '10px' : '10px 12px',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)',
          color: 'rgba(239,68,68,0.7)',
          transition: 'all 0.2s ease',
        }}
        title={collapsed ? 'Logout' : undefined}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>🚪</span>
        {!collapsed && <span style={{ fontSize: 12, fontWeight: 600 }}>Logout</span>}
      </div>
    </aside>
  );
}
