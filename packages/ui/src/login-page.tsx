'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

export interface LoginPageProps {
  /** Module title (e.g. "Health & Safety") */
  title: string;
  /** Subtitle (e.g. "ISO 45001 Compliance") */
  subtitle?: string;
  /** Theme color for gradient and accents */
  themeColor?: string;
  /** Icon component to render */
  icon?: React.ReactNode;
  /** Gateway API URL */
  apiUrl?: string;
  /** Callback after successful login */
  onLoginSuccess?: () => void;
  /** Callback to check if already authenticated */
  checkAuth?: () => boolean;
}

export function LoginPage({
  title,
  subtitle,
  themeColor = 'blue',
  icon,
  apiUrl,
  onLoginSuccess,
  checkAuth,
}: LoginPageProps) {
  const gatewayUrl = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (checkAuth && checkAuth()) {
      onLoginSuccess?.();
    } else {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        onLoginSuccess?.();
      } else {
        setCheckingAuth(false);
      }
    }
  }, [checkAuth, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    let loginSucceeded = false;
    try {
      const response = await fetch(`${gatewayUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { accessToken: token, user } = data.data;
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        loginSucceeded = true;
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }

    if (loginSucceeded) {
      onLoginSuccess?.();
    }
  };

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--ink, #080B12)' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-4"
          style={{
            borderColor: 'var(--border, #1E2E48)',
            borderTopColor: 'var(--blue-hi, #5B94FF)',
          }}
        />
      </div>
    );
  }

  const accentMap: Record<string, { accent: string; glow: string }> = {
    red: { accent: 'var(--m-safety, #F04B5A)', glow: 'rgba(240,75,90,0.15)' },
    green: { accent: 'var(--m-env, #00C4A8)', glow: 'rgba(0,196,168,0.15)' },
    blue: { accent: 'var(--m-quality, #3B78F5)', glow: 'rgba(59,120,245,0.15)' },
    purple: { accent: 'var(--m-hr, #9B6FEA)', glow: 'rgba(155,111,234,0.15)' },
    orange: { accent: 'var(--m-crm, #FB923C)', glow: 'rgba(251,146,60,0.15)' },
    indigo: { accent: 'var(--blue-core, #2660D8)', glow: 'rgba(38,96,216,0.15)' },
    teal: { accent: 'var(--teal-core, #00C4A8)', glow: 'rgba(0,196,168,0.15)' },
    amber: { accent: 'var(--m-payroll, #F59E0B)', glow: 'rgba(245,158,11,0.15)' },
  };

  const accent = accentMap[themeColor] || accentMap.blue;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--ink, #080B12)' }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {icon && (
            <div
              className="inline-flex items-center justify-center p-4 rounded-full mb-4"
              style={{ backgroundColor: accent.glow }}
            >
              {icon}
            </div>
          )}
          <h1
            className="text-3xl font-bold font-display"
            style={{ color: 'var(--white, #EDF3FC)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1" style={{ color: 'var(--steel, #5A7099)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6 shadow-2xl"
          style={{
            backgroundColor: 'var(--surface, #162032)',
            border: '1px solid var(--border, #1E2E48)',
          }}
        >
          <div className="space-y-1 mb-6 text-center">
            <h2
              className="text-2xl font-semibold font-display"
              style={{ color: 'var(--white, #EDF3FC)' }}
            >
              Sign In
            </h2>
            <p style={{ color: 'var(--steel, #5A7099)', fontSize: '0.875rem' }}>
              Enter your credentials to access {title}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md"
                style={{
                  backgroundColor: 'rgba(240,75,90,0.1)',
                  border: '1px solid rgba(240,75,90,0.3)',
                }}
              >
                <p className="text-sm" style={{ color: '#F04B5A' }}>
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: 'var(--silver, #8EA8CC)' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                className="h-11"
                style={{
                  backgroundColor: 'var(--raised, #1C2940)',
                  borderColor: 'var(--border, #1E2E48)',
                  color: 'var(--white, #EDF3FC)',
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: 'var(--silver, #8EA8CC)' }}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                  style={{
                    backgroundColor: 'var(--raised, #1C2940)',
                    borderColor: 'var(--border, #1E2E48)',
                    color: 'var(--white, #EDF3FC)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--steel, #5A7099)' }}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded"
                  style={{ borderColor: 'var(--border, #1E2E48)' }}
                  disabled={loading}
                />
                <span className="text-sm" style={{ color: 'var(--steel, #5A7099)' }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm hover:underline"
                style={{ color: accent.accent }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${accent.accent}, ${accent.accent}dd)`,
                color: '#ffffff',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted, #344D72)' }}>
          Nexara — Integrated Management System
        </p>
      </div>
    </div>
  );
}
