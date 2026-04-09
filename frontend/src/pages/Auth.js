import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Orb, Spinner } from '../components/UI';
import { authAPI } from '../api/client';

// ─── Shared Auth Card Layout ──────────────────────────────────
function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#050812,#0d0f24)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative',
    }}>
      <Orb color="#00f5ff" size={280} left="-100px" top="-100px" opacity={0.1} />
      <Orb color="#8b5cf6" size={220} left="70%" top="55%" opacity={0.08} />

      <div className="glass-card animate-fadeUp" style={{ width: '100%', maxWidth: 400, padding: 32, position: 'relative', zIndex: 1 }}>
        {/* Back to Landing */}
        <Link to="/" style={{ position: 'absolute', top: 14, right: 14, color: 'rgba(226,232,240,0.35)', fontSize: 20, textDecoration: 'none' }}>×</Link>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 5 }} className="gradient-text">
            {title}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)' }}>{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function useResetCountdown(token) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!token) {
      setRemainingMs(0);
      return undefined;
    }

    const updateCountdown = () => {
      const payload = decodeJwtPayload(token);
      const expiryMs = payload?.exp ? payload.exp * 1000 : 0;
      setRemainingMs(Math.max(0, expiryMs - Date.now()));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [token]);

  return remainingMs;
}

// ─── LOGIN PAGE ───────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) navigate('/dashboard');
      else setError(result.message || 'Invalid email or password.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Connection error. Make sure the backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your preparation">
      {/* Tab Toggle */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: 3, marginBottom: 20 }}>
        {[['Sign In', '/login'], ['Register', '/register']].map(([label, path]) => (
          <Link key={label} to={path} style={{
            flex: 1, padding: 8, borderRadius: 7, textAlign: 'center',
            background: path === '/login' ? 'rgba(0,245,255,0.1)' : 'transparent',
            color: path === '/login' ? '#00f5ff' : 'rgba(226,232,240,0.4)',
            fontWeight: 600, fontSize: 12, textDecoration: 'none',
            transition: 'all 0.25s',
          }}>
            {label}
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="input" type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
        />
        <input
          className="input" type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
        />
        <div style={{ textAlign: 'right', marginTop: -4 }}>
          <Link to="/forgot-password" style={{ fontSize: 11, color: '#00f5ff' }}>Forgot password?</Link>
        </div>

        {error && (
          <div style={{
            padding: '9px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', fontSize: 12,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit" className="btn btn-primary"
          style={{ padding: '13px', fontSize: 14, marginTop: 4, width: '100%' }}
          disabled={loading}
        >
          {loading ? <Spinner size={18} /> : 'Sign In →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(226,232,240,0.35)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#00f5ff', fontWeight: 600 }}>Register free</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>
        Admin access? <Link to="/admin/login" style={{ color: '#8b5cf6', fontWeight: 600 }}>Sign in here</Link>
      </p>
    </AuthLayout>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────
export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Name, email, and password are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password, form.college);
      if (result.success) navigate('/dashboard');
      else setError(result.message || 'Registration failed. Please try again.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Connection error. Make sure the backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join PrepPro" subtitle="Create your free account today">
      {/* Tab Toggle */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: 3, marginBottom: 20 }}>
        {[['Sign In', '/login'], ['Register', '/register']].map(([label, path]) => (
          <Link key={label} to={path} style={{
            flex: 1, padding: 8, borderRadius: 7, textAlign: 'center',
            background: path === '/register' ? 'rgba(0,245,255,0.1)' : 'transparent',
            color: path === '/register' ? '#00f5ff' : 'rgba(226,232,240,0.4)',
            fontWeight: 600, fontSize: 12, textDecoration: 'none',
            transition: 'all 0.25s',
          }}>
            {label}
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <input className="input" type="text" placeholder="Full Name *" value={form.name} onChange={update('name')} />
        <input className="input" type="email" placeholder="Email address *" value={form.email} onChange={update('email')} autoComplete="email" />
        <input className="input" type="password" placeholder="Password (min 6 chars) *" value={form.password} onChange={update('password')} autoComplete="new-password" />
        <input className="input" type="text" placeholder="College / University" value={form.college} onChange={update('college')} />

        {error && (
          <div style={{
            padding: '9px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', fontSize: 12,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit" className="btn btn-primary"
          style={{ padding: 13, fontSize: 14, marginTop: 4, width: '100%' }}
          disabled={loading}
        >
          {loading ? <Spinner size={18} /> : 'Create Account →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(226,232,240,0.35)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#00f5ff', fontWeight: 600 }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields.'); return; }

    setLoading(true);
    try {
      const result = await adminLogin(email, password);
      if (result.success) navigate('/admin-dashboard');
      else setError(result.message || 'Invalid admin credentials.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Portal" subtitle="Sign in with admin credentials">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="input" type="email" placeholder="Admin email"
          value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
        />
        <input
          className="input" type="password" placeholder="Admin password"
          value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
        />

        <div style={{ textAlign: 'right', marginTop: -4 }}>
          <Link to="/admin/forgot-password" style={{ fontSize: 11, color: '#8b5cf6' }}>Forgot admin password?</Link>
        </div>

        {error && (
          <div style={{
            padding: '9px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', fontSize: 12,
          }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-purple" style={{ padding: '13px', fontSize: 14, marginTop: 4, width: '100%' }} disabled={loading}>
          {loading ? <Spinner size={18} /> : 'Admin Sign In →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(226,232,240,0.35)' }}>
        Candidate? <Link to="/login" style={{ color: '#00f5ff', fontWeight: 600 }}>Go to candidate login</Link>
      </p>
    </AuthLayout>
  );
}

export function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!email) return setError('Admin email is required.');
    setLoading(true);
    try {
      const res = await authAPI.adminForgotPassword({ email });
      setMsg(res.data?.message || 'Admin reset link sent.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send admin reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Forgot Password" subtitle="Reset your admin account password">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input" type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} />
        {msg && <div style={{ color: '#10b981', fontSize: 12 }}>{msg}</div>}
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        <button type="submit" className="btn btn-purple" disabled={loading}>{loading ? <Spinner size={16} /> : 'Send Admin Reset Link'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
        <Link to="/admin/login" style={{ color: '#8b5cf6' }}>Back to admin login</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>
        Candidate account? <Link to="/forgot-password" style={{ color: '#00f5ff', fontWeight: 600 }}>Use candidate reset</Link>
      </p>
    </AuthLayout>
  );
}

export function AdminResetPassword() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const remainingMs = useResetCountdown(token);
  const isExpired = remainingMs <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!token) return setError('Invalid reset token.');
    if (isExpired) return setError('This reset link has expired. Please request a new one.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await authAPI.adminResetPassword({ token, newPassword: password });
      const payload = res.data?.data;
      if (res.data?.success && payload?.token && payload?.user) {
        const normalizedUser = { ...payload.user, role: 'ADMIN' };
        localStorage.setItem('isp_token', payload.token);
        localStorage.setItem('isp_user', JSON.stringify(normalizedUser));
        setMsg('Admin password reset successful. Redirecting to dashboard...');
        setTimeout(() => { window.location.href = '/admin-dashboard'; }, 900);
      } else {
        setMsg(res.data?.message || 'Admin password reset successful. Redirecting to dashboard...');
        setTimeout(() => { window.location.href = '/admin-dashboard'; }, 900);
      }
    } catch {
      setError('Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Admin Password" subtitle="Set a new admin password">
      <div style={{ marginBottom: 12, textAlign: 'center', fontSize: 12, color: isExpired ? '#ef4444' : 'rgba(226,232,240,0.65)' }}>
        {isExpired ? 'Reset link expired. Request a new email.' : `Link expires in ${formatCountdown(remainingMs)}`}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input" type="password" placeholder="New admin password" value={password} onChange={e => setPassword(e.target.value)} />
        {msg && <div style={{ color: '#10b981', fontSize: 12 }}>{msg}</div>}
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        <button type="submit" className="btn btn-purple" disabled={loading || isExpired}>{loading ? <Spinner size={16} /> : 'Reset Admin Password'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
        <Link to="/admin/login" style={{ color: '#8b5cf6' }}>Back to admin login</Link>
      </p>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!email) return setError('Email is required.');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setMsg(res.data?.message || 'Password reset link sent.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="We will email your reset link">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
        {msg && <div style={{ color: '#10b981', fontSize: 12 }}>{msg}</div>}
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Spinner size={16} /> : 'Send Reset Link'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
        <Link to="/login" style={{ color: '#00f5ff' }}>Back to login</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(226,232,240,0.35)' }}>
        Admin account? <Link to="/admin/forgot-password" style={{ color: '#8b5cf6', fontWeight: 600 }}>Use admin reset</Link>
      </p>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const remainingMs = useResetCountdown(token);
  const isExpired = remainingMs <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!token) return setError('Invalid reset token.');
    if (isExpired) return setError('This reset link has expired. Please request a new one.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ token, newPassword: password });
      const payload = res.data?.data;
      if (res.data?.success && payload?.token && payload?.user) {
        localStorage.setItem('isp_token', payload.token);
        localStorage.setItem('isp_user', JSON.stringify(payload.user));
        setMsg('Password reset successful. Redirecting to dashboard...');
        setTimeout(() => { window.location.href = '/dashboard'; }, 900);
      } else {
        setMsg(res.data?.message || 'Password reset successful. Redirecting to dashboard...');
        setTimeout(() => { window.location.href = '/dashboard'; }, 900);
      }
    } catch {
      setError('Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Set a new secure password">
      <div style={{ marginBottom: 12, textAlign: 'center', fontSize: 12, color: isExpired ? '#ef4444' : 'rgba(226,232,240,0.65)' }}>
        {isExpired ? 'Reset link expired. Request a new email.' : `Link expires in ${formatCountdown(remainingMs)}`}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input" type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} />
        {msg && <div style={{ color: '#10b981', fontSize: 12 }}>{msg}</div>}
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading || isExpired}>{loading ? <Spinner size={16} /> : 'Reset Password'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
        <Link to="/login" style={{ color: '#00f5ff' }}>Back to login</Link>
      </p>
    </AuthLayout>
  );
}
