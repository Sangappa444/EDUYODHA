'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { LogIn, Key, Mail, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Dispatch custom event to notify Navbar
        window.dispatchEvent(new Event('user-state-change'));
        // Redirect to homepage or user dashboard
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl transition-all relative overflow-hidden">
        
        {/* Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500" />
        
        <div className="text-center mb-8">
          <span className="text-3xl inline-block mb-3">🛡️</span>
          <h2 className="text-2xl font-black tracking-tight text-slate-850 dark:text-slate-100">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
            Access your courses, notes, and predictor cutoffs
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold mb-6">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <a href="#" className="text-[10px] font-bold text-blue-500 hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Key size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all"
          >
            {loading ? 'Logging in...' : <><LogIn size={16} /> Login</>}
          </button>
        </form>

        <div className="h-px bg-slate-200 dark:bg-slate-850 my-6" />

        <p className="text-center text-xs text-slate-500">
          Don\'t have an account?{' '}
          <Link href="/auth/register" className="text-blue-500 font-bold hover:underline">
            Register Here
          </Link>
        </p>

      </div>
    </div>
  );
}
