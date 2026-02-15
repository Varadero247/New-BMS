'use client';

import * as React from 'react';
import { cn } from './utils';

/** Available deployment environments */
export type LoginEnvironment = 'local' | 'staging' | 'production';

export interface LoginModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Called after successful login with the access token */
  onSuccess?: (token: string) => void;
  /** Default environment tab */
  defaultEnv?: LoginEnvironment;
  /** Additional class names */
  className?: string;
}

const envConfig: Record<LoginEnvironment, { label: string; url: string; apiBase: string; description: string }> = {
  local: {
    label: 'Local',
    url: 'localhost:3000',
    apiBase: 'http://localhost:4000',
    description: 'Development',
  },
  staging: {
    label: 'Staging',
    url: 'staging.nexara.app',
    apiBase: 'https://api-staging.nexara.app',
    description: 'Pre-production',
  },
  production: {
    label: 'Production',
    url: 'app.nexara.app',
    apiBase: 'https://api.nexara.app',
    description: 'Live',
  },
};

/**
 * LoginModal — Nexara branded login modal with environment switcher.
 * Supports Local / Staging / Production environments.
 * Pre-fills dev credentials in local mode.
 */
export function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  defaultEnv = 'local',
  className,
}: LoginModalProps) {
  const [env, setEnv] = React.useState<LoginEnvironment>(defaultEnv);
  const [email, setEmail] = React.useState(defaultEnv === 'local' ? 'admin@ims.local' : '');
  const [password, setPassword] = React.useState(defaultEnv === 'local' ? 'admin123' : '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const backdropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (env === 'local') {
      setEmail('admin@ims.local');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
    setError('');
  }, [env]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const apiBase = envConfig[env].apiBase;
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { accessToken: token, user } = data.data;
        localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        onSuccess?.(token);

        if (env === 'local') {
          window.location.href = 'http://localhost:3000';
        } else if (env === 'staging') {
          window.location.href = 'https://staging.nexara.app';
        } else {
          window.location.href = 'https://app.nexara.app';
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Network error. Is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}
      style={{ backgroundColor: 'rgba(8, 11, 18, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--silver)' }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: 'var(--white)',
                marginBottom: 4,
              }}
            >
              Sign in to Nexara
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'var(--steel)',
              }}
            >
              Select your environment to continue
            </p>
          </div>

          {/* Environment tabs */}
          <div
            className="flex gap-1 mb-6 p-1"
            style={{
              backgroundColor: 'var(--deep)',
              borderRadius: 10,
            }}
          >
            {(Object.keys(envConfig) as LoginEnvironment[]).map((key) => {
              const isActive = env === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEnv(key)}
                  className="flex-1 py-2 px-3 transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    borderRadius: 8,
                    color: isActive ? 'var(--white)' : 'var(--steel)',
                    backgroundColor: isActive ? 'var(--raised)' : 'transparent',
                    border: isActive ? '1px solid var(--border-hi)' : '1px solid transparent',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{envConfig[key].label}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: 2 }}>
                    {envConfig[key].url}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="px-3 py-2"
                style={{
                  backgroundColor: 'rgba(240, 75, 90, 0.1)',
                  border: '1px solid rgba(240, 75, 90, 0.2)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'var(--m-safety)',
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--steel)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="w-full outline-none transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  padding: '10px 14px',
                  borderRadius: 8,
                  backgroundColor: 'var(--deep)',
                  border: '1px solid var(--border)',
                  color: 'var(--white)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-mid)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--steel)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="w-full outline-none transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  padding: '10px 14px',
                  borderRadius: 8,
                  backgroundColor: 'var(--deep)',
                  border: '1px solid var(--border)',
                  color: 'var(--white)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue-mid)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '12px 0',
                borderRadius: 8,
                background: 'var(--g-brand)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                OR
              </span>
              <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
            </div>

            {/* SSO Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  padding: '10px 0',
                  borderRadius: 8,
                  backgroundColor: 'var(--deep)',
                  border: '1px solid var(--border)',
                  color: 'var(--silver)',
                  cursor: 'pointer',
                }}
                onClick={() => { /* Wire to OAuth */ }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="var(--blue-hi)" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--teal-core)" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="var(--m-payroll)" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--m-safety)" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  padding: '10px 0',
                  borderRadius: 8,
                  backgroundColor: 'var(--deep)',
                  border: '1px solid var(--border)',
                  color: 'var(--silver)',
                  cursor: 'pointer',
                }}
                onClick={() => { /* Wire to OAuth */ }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Environment indicator */}
          <div className="mt-5 text-center">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                color: 'var(--muted)',
              }}
            >
              {envConfig[env].url} &middot; {envConfig[env].description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
