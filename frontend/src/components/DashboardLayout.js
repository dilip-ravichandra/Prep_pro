import React from 'react';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 220;

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050812' }}>
      <Sidebar />
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
