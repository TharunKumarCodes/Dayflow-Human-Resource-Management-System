import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Sparkles, User, Lock, Mail, Building, Briefcase, BadgeCheck, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeCode: '',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Software Engineer',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'HR_ADMIN') {
        navigate('/hr-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 my-8">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-500 mx-auto flex items-center justify-center shadow-xl shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-outfit text-2xl font-bold text-white">Create Dayflow Account</h1>
          <p className="text-xs text-slate-400">Register employee or administrator profile</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="Priya"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="Sharma"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Work Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="priya.sharma@dayflow.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Employee ID Code</label>
              <input
                type="text"
                name="employeeCode"
                placeholder="EMP-1001"
                value={formData.employeeCode}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Role Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="HR_ADMIN">HR_ADMIN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Department</label>
              <input
                type="text"
                name="department"
                placeholder="Engineering"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Full Stack Engineer"
                value={formData.designation}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-brand-600/25 hover:brightness-110 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
