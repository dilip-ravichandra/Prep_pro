import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResultsProvider } from './context/ResultsContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';
import ChatWidget from './components/ChatWidget';
import './styles/global.css';

// Pages
import Landing from './pages/Landing';
import { Login, Register, AdminLogin, AdminForgotPassword, AdminResetPassword, ForgotPassword, ResetPassword } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminLeaderboard from './pages/AdminLeaderboard';
import AdminAptitudePage from './pages/AdminAptitudePage';
import AdminTechnicalPage from './pages/AdminTechnicalPage';
import AdminBehavioralPage from './pages/AdminBehavioralPage';
import AptitudeRound from './pages/AptitudeRound';
import TechnicalRound from './pages/TechnicalRound';
import BehavioralRound from './pages/BehavioralRound';
import BreakScreen from './pages/BreakScreen';
import { ResultPage, Analytics, Leaderboard, Profile } from './pages/OtherPages';


// ─── Layout Wrapper for dashboard pages ──────────────────────
function WithLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

// ─── Admin Layout wrapper ────────────────────────────────────
function WithAdminLayout({ children }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}

// ─── Protected + Layout wrapper ───────────────────────────────
function ProtectedWithLayout({ children, allowRoles }) {
  return (
    <ProtectedRoute allowRoles={allowRoles}>
      <WithLayout>{children}</WithLayout>
    </ProtectedRoute>
  );
}

// ─── Protected + Admin Layout wrapper ─────────────────────────
function ProtectedWithAdminLayout({ children, allowRoles }) {
  return (
    <ProtectedRoute allowRoles={allowRoles}>
      <WithAdminLayout>{children}</WithAdminLayout>
    </ProtectedRoute>
  );
}

// ─── Protected WITHOUT layout (full-screen round pages) ───────
function ProtectedNoLayout({ children, allowRoles }) {
  return <ProtectedRoute allowRoles={allowRoles}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ResultsProvider>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ── Dashboard (with sidebar) ── */}
            <Route path="/dashboard" element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><Dashboard /></ProtectedWithLayout>} />
            <Route path="/analytics"  element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><Analytics /></ProtectedWithLayout>} />
            <Route path="/leaderboard"element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><Leaderboard /></ProtectedWithLayout>} />
            <Route path="/profile"    element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><Profile /></ProtectedWithLayout>} />

            {/* ── Admin Dashboard (with admin sidebar) ── */}
            <Route path="/admin-dashboard" element={<ProtectedWithAdminLayout allowRoles={['ADMIN']}><AdminLeaderboard /></ProtectedWithAdminLayout>} />
            <Route path="/admin" element={<ProtectedWithAdminLayout allowRoles={['ADMIN']}><AdminLeaderboard /></ProtectedWithAdminLayout>} />
            <Route path="/admin/aptitude" element={<ProtectedWithAdminLayout allowRoles={['ADMIN']}><AdminAptitudePage /></ProtectedWithAdminLayout>} />
            <Route path="/admin/technical" element={<ProtectedWithAdminLayout allowRoles={['ADMIN']}><AdminTechnicalPage /></ProtectedWithAdminLayout>} />
            <Route path="/admin/behavioral" element={<ProtectedWithAdminLayout allowRoles={['ADMIN']}><AdminBehavioralPage /></ProtectedWithAdminLayout>} />

            {/* ── Round Result pages (with sidebar) ── */}
            <Route path="/aptitude/result"  element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><ResultPage type="aptitude" /></ProtectedWithLayout>} />
            <Route path="/technical/result" element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><ResultPage type="technical" /></ProtectedWithLayout>} />
            <Route path="/behavioral/result"element={<ProtectedWithLayout allowRoles={['CANDIDATE']}><ResultPage type="behavioral" /></ProtectedWithLayout>} />

            {/* ── Round pages (full-screen, no sidebar) ── */}
            <Route path="/aptitude"  element={<ProtectedNoLayout allowRoles={['CANDIDATE']}><AptitudeRound /></ProtectedNoLayout>} />
            <Route path="/technical" element={<ProtectedNoLayout allowRoles={['CANDIDATE']}><TechnicalRound /></ProtectedNoLayout>} />
            <Route path="/technical-round" element={<ProtectedNoLayout allowRoles={['CANDIDATE']}><TechnicalRound /></ProtectedNoLayout>} />
            <Route path="/behavioral"element={<ProtectedNoLayout allowRoles={['CANDIDATE']}><BehavioralRound /></ProtectedNoLayout>} />
            <Route path="/break"     element={<ProtectedNoLayout allowRoles={['CANDIDATE']}><BreakScreen /></ProtectedNoLayout>} />

            {/* ── Catch all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ChatWidget />
        </ResultsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
