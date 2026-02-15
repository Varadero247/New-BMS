'use client';
import { useState } from 'react';
export default function LoginPage() {
  const [email, setEmail] = useState('admin@ims.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try { const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await res.json(); if (data.data?.accessToken) { localStorage.setItem('token', data.data.accessToken); window.location.href = '/'; } else { setError('Invalid credentials'); } } catch { setError('Login failed'); }
  }
  return (<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800"><form onSubmit={handleLogin} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-96"><h1 className="text-2xl font-bold mb-6">Login</h1>{error && <p className="text-red-500 mb-4">{error}</p>}<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="Email" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="Password" /><button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">Login</button></form></div>);
}
