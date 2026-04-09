import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './UI';

export default function ProtectedRoute({ children, allowRoles }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#050812', flexDirection: 'column', gap: 16,
      }}>
        <Spinner size={36} />
        <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 13 }}>Loading PrepPro...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const adminOnly = allowRoles?.length === 1 && allowRoles.includes('ADMIN');
    return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  }

  if (allowRoles && allowRoles.length > 0 && !allowRoles.includes(role)) {
    const redirectTo = role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
