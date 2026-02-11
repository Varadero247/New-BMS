'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
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
        onLoginSuccess?.();
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@ims.local');
    setPassword('admin123');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  const colorMap: Record<string, { bg: string; text: string; iconBg: string; checkbox: string; link: string; gradient: string }> = {
    red: { bg: 'bg-red-600', text: 'text-red-600', iconBg: 'bg-red-100', checkbox: 'text-red-600 focus:ring-red-500', link: 'text-red-600', gradient: 'from-red-50 to-gray-100' },
    green: { bg: 'bg-green-600', text: 'text-green-600', iconBg: 'bg-green-100', checkbox: 'text-green-600 focus:ring-green-500', link: 'text-green-600', gradient: 'from-green-50 to-gray-100' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', iconBg: 'bg-blue-100', checkbox: 'text-blue-600 focus:ring-blue-500', link: 'text-blue-600', gradient: 'from-blue-50 to-gray-100' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', iconBg: 'bg-purple-100', checkbox: 'text-purple-600 focus:ring-purple-500', link: 'text-purple-600', gradient: 'from-purple-50 to-gray-100' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600', iconBg: 'bg-orange-100', checkbox: 'text-orange-600 focus:ring-orange-500', link: 'text-orange-600', gradient: 'from-orange-50 to-gray-100' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', iconBg: 'bg-indigo-100', checkbox: 'text-indigo-600 focus:ring-indigo-500', link: 'text-indigo-600', gradient: 'from-indigo-50 to-gray-100' },
    teal: { bg: 'bg-teal-600', text: 'text-teal-600', iconBg: 'bg-teal-100', checkbox: 'text-teal-600 focus:ring-teal-500', link: 'text-teal-600', gradient: 'from-teal-50 to-gray-100' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', iconBg: 'bg-amber-100', checkbox: 'text-amber-600 focus:ring-amber-500', link: 'text-amber-600', gradient: 'from-amber-50 to-gray-100' },
  };

  const colors = colorMap[themeColor] || colorMap.blue;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${colors.gradient} p-4`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {icon && (
            <div className={`inline-flex items-center justify-center p-4 ${colors.iconBg} rounded-full mb-4`}>
              {icon}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access {title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ims.local"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className={`h-4 w-4 rounded border-gray-300 ${colors.checkbox}`}
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className={`text-sm ${colors.link} hover:underline`} onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">Development</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={fillDemoCredentials} disabled={loading}>
                Fill Demo Credentials
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-400 mt-6">
          IMS - Integrated Management System
        </p>
      </div>
    </div>
  );
}
