import React from 'react';
import AdminSidebar from './AdminSidebar';

const SIDEBAR_WIDTH = 240;

export default function AdminDashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050812' }}>
      <AdminSidebar />
      <main style={{
        marginLeft: SIDEBAR_WIDTH,
        flex: 1,
        minHeight: '100vh',
        overflowX: 'hidden',
        transition: 'margin-left 0.3s ease',
      }}>
        {children}
      </main>
    </div>
  );
}
