import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  DollarSign, 
  Calendar,
  Activity,
  FileCheck2,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-outfit text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Dayflow
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400 block -mt-1">
              AI HRMS & Payroll Protection
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/20 hover:brightness-110 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-8 animate-fade-in">
          <BrainCircuit className="w-4 h-4 text-brand-400" />
          <span>Explainable AI Attendance Anomaly Engine v1.0</span>
        </div>

        <h1 className="font-outfit text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-none max-w-4xl mx-auto">
          Every workday, <br />
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            perfectly aligned.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Dayflow unifies employee onboarding, attendance tracking, leave workflows, and payroll calculation into a single intelligent platform — guarded by an explainable AI anomaly scoring engine.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white font-bold text-sm shadow-xl shadow-brand-600/25 hover:scale-105 transition-all flex items-center justify-center space-x-2"
          >
            <span>Launch Live HR Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Register Organization
          </button>
        </div>

        {/* Key Feature Stats Pills */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <p className="text-xl font-bold text-white">Human-In-The-Loop</p>
            <p className="text-xs text-slate-400 mt-1">Zero auto-deductions without explicit HR review.</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <BrainCircuit className="w-6 h-6 text-brand-400 mb-2" />
            <p className="text-xl font-bold text-white">Plain-Language AI</p>
            <p className="text-xs text-slate-400 mt-1">Explainable scoring rules with transparent risk reasons.</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <DollarSign className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-xl font-bold text-white">Protected Payroll</p>
            <p className="text-xs text-slate-400 mt-1">Payroll calculations hold unverified anomaly records.</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <FileCheck2 className="w-6 h-6 text-violet-400 mb-2" />
            <p className="text-xl font-bold text-white">Full Audit Logs</p>
            <p className="text-xs text-slate-400 mt-1">Complete accountability trail for every HR decision.</p>
          </div>
        </div>
      </section>

      {/* Core Differentiator Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Core Innovation
            </span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white mt-2">
              AI Attendance Integrity & Payroll Protection Engine
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mt-4">
              Traditional systems blindly calculate payroll or depend on opaque black-box rules. Dayflow introduces a transparent, explainable anomaly scoring system that surfaces attendance risk for human review before any financial impact occurs.
            </p>

            <ul className="space-y-3 mt-6 text-xs text-slate-300 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Multi-factor analysis: Late check-in, short shift duration, rolling variance.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Plain-language risk justifications for every flagged anomaly.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>HR review workflow: Approve, Correct, or Request Employee Input.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-sm text-slate-200">Attendance Integrity Center</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                HIGH RISK (78%)
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Priya Sharma • Engineering</span>
                  <span className="text-slate-500">Aug 22, 2026</span>
                </div>
                <div className="mt-2 text-slate-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg text-[11px] leading-snug">
                  "Late arrival (165 mins past scheduled 9:00 AM start) combined with short shift duration (3.5 hrs recorded vs 8.0 hrs standard baseline)."
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-amber-400 font-medium">Payroll Hold: Action Required</span>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">Approve</span>
                    <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">Correct</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 Dayflow HRMS Systems. Built for Hackathon MVP Demonstration.</p>
      </footer>
    </div>
  );
};
