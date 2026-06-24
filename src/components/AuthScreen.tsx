import React, { useState } from 'react';
import { QrCode, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { signUp, login } from '../utils/auth';
import type { AuthUser } from '../utils/auth';

interface AuthScreenProps {
  initialTab?: 'login' | 'signup';
  onAuth: (user: AuthUser) => void;
  onSwitchTab?: (tab: 'login' | 'signup') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialTab = 'login', onAuth, onSwitchTab }) => {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);

  const handleTabChange = (nextTab: 'login' | 'signup') => {
    setTab(nextTab);
    onSwitchTab?.(nextTab);
  };

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError]       = useState('');
  const [loginLoading, setLoginLoading]   = useState(false);

  // Sign-up fields
  const [signupName, setSignupName]           = useState('');
  const [signupEmail, setSignupEmail]         = useState('');
  const [signupPassword, setSignupPassword]   = useState('');
  const [signupConfirm, setSignupConfirm]     = useState('');
  const [signupError, setSignupError]         = useState('');
  const [signupLoading, setSignupLoading]     = useState(false);

  const [showPwd, setShowPwd] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      if (!user) {
        setLoginError('Invalid email or password. Please try again.');
      } else {
        onAuth(user);
      }
    } catch (err: any) {
      setLoginError(err.message || 'An error occurred.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    setSignupLoading(true);
    try {
      const user = await signUp(signupName, signupEmail, signupPassword);
      onAuth(user);
    } catch (err: any) {
      setSignupError(err.message || 'An error occurred.');
    } finally {
      setSignupLoading(false);
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: 'var(--font-inter)',
    fontSize: 14,
    color: 'var(--color-text-primary)',
    backgroundColor: '#080808',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 100ms ease-out, box-shadow 100ms ease-out',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
  };

  const errorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    backgroundColor: 'var(--color-error-dim)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  };

  const focusHandlers = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!el) return;
    el.addEventListener('focus', () => {
      el.style.borderColor = 'var(--color-accent)';
      el.style.boxShadow   = '0 0 0 3px var(--color-accent-dim)';
    });
    el.addEventListener('blur', () => {
      el.style.borderColor = 'var(--color-border)';
      el.style.boxShadow   = 'none';
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-app-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
    }}>
      {/* Dot grid background */}
      <div className="dot-grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

      {/* Radial glow */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(204,255,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '36px 32px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            backgroundColor: 'var(--color-accent)',
            color: '#000',
            width: 32, height: 32,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QrCode size={18} />
          </div>
          <span className="font-satoshi" style={{ fontSize: 18, fontWeight: 600 }}>
            chroni<span style={{ color: 'var(--color-accent)' }}>QR</span>
          </span>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#080808',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 3,
          marginBottom: 28,
        }}>
          {(['login', 'signup'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabChange(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-inter)',
                transition: 'all 100ms ease-out',
                backgroundColor: tab === t ? 'var(--color-surface-hover)' : 'transparent',
                color: tab === t ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {t === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* ── Login Form ──────────────────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Welcome back
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Sign in to your chroniQR workspace
              </p>
            </div>

            {loginError && (
              <div style={errorStyle}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="login-email" style={labelStyle}>Email address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                ref={focusHandlers}
                style={inputStyle}
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  ref={focusHandlers}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-disabled)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loginLoading}
              className="btn btn-accent"
              style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 4 }}
            >
              {loginLoading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontWeight: 600, fontSize: 13 }}
              >
                Sign up free
              </button>
            </p>
          </form>
        )}

        {/* ── Sign Up Form ────────────────────────────────────────────────── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Create your account
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Start building time-aware QR codes for free
              </p>
            </div>

            {signupError && (
              <div style={errorStyle}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {signupError}
              </div>
            )}

            <div>
              <label htmlFor="signup-name" style={labelStyle}>Full name</label>
              <input
                id="signup-name"
                type="text"
                required
                ref={focusHandlers}
                style={inputStyle}
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="signup-email" style={labelStyle}>Work email</label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                ref={focusHandlers}
                style={inputStyle}
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="signup-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  ref={focusHandlers}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-disabled)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm" style={labelStyle}>Confirm password</label>
              <input
                id="signup-confirm"
                type={showPwd ? 'text' : 'password'}
                required
                ref={focusHandlers}
                style={inputStyle}
                value={signupConfirm}
                onChange={e => setSignupConfirm(e.target.value)}
                placeholder="Repeat password"
              />
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={signupLoading}
              className="btn btn-accent"
              style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 4 }}
            >
              {signupLoading ? 'Creating account…' : <>Create account <ArrowRight size={15} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontWeight: 600, fontSize: 13 }}
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Bottom note */}
      <p style={{
        marginTop: 24,
        fontSize: 12,
        color: 'var(--color-text-disabled)',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        By continuing, you agree to the chroniQR terms of service.
      </p>
    </div>
  );
};
