import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Sparkles, Shield, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'HR_ADMIN') {
        navigate('/hr-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email: demoEmail, password: demoPass });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'HR_ADMIN') {
        navigate('/hr-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-500 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-outfit text-2xl font-bold text-white">Welcome to Dayflow</h1>
          <p className="text-xs text-slate-400">Sign in to access your HR Portal & Attendance Dashboard</p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-400">
            <Shield className="w-4 h-4" />
            <span>1-Click Hackathon Demo Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@dayflow.com', 'admin123')}
              className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/40 hover:border-indigo-400 text-left font-medium transition-all"
            >
              <div className="font-bold text-white">Arjun Mehta</div>
              <div className="text-[10px] text-indigo-300">HR Manager</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('priya.sharma@dayflow.com', 'password123')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 text-left font-medium transition-all"
            >
              <div className="font-bold text-white">Priya Sharma</div>
              <div className="text-[10px] text-slate-400">Sr Engineer</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Work Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@dayflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-brand-600/25 hover:brightness-110 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-semibold hover:underline">
            Register Employee Account
          </Link>
        </div>
      </div>
    </div>
  );
};
