import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, HeartPulse, ShieldCheck, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(`Demo login failed for ${demoEmail}. Make sure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-6 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[var(--border-color)]">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--primary)] mb-3 shadow-xs">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Smart Growth Tracker
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            WHO & CDC Aligned Pediatric Developmental Portal
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 text-rose-800 text-xs rounded-xl font-medium animate-in fade-in duration-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] focus:bg-white font-medium"
                placeholder="parent@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] focus:bg-white font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 btn-primary text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Sign-in */}
        <div className="pt-3 border-t border-[var(--border-color)]">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Demo Access (1-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('parent@example.com', 'password123')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Parent Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Footer info & Register link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[var(--primary)] hover:underline">
              Create parent account
            </Link>
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>WHO Anthro & CDC Milestone Standards Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
