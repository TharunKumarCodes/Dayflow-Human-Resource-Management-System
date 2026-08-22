import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Attendance, Payroll, LeaveRequest } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  CalendarOff, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { SalarySlipModal } from '../components/SalarySlipModal';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [myPayrolls, setMyPayrolls] = useState<Payroll[]>([]);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEmployeeDashboardData = async () => {
    try {
      setLoading(true);
      const [attRes, payRes, leaveRes] = await Promise.all([
        api.get('/attendance/my'),
        api.get('/payroll/my'),
        api.get('/leaves/my'),
      ]);

      const attendances: Attendance[] = attRes.data.attendances || [];
      setAttendanceSummary(attRes.data.summary || {});
      setMyPayrolls(payRes.data.payrolls || []);
      setMyLeaves(leaveRes.data.leaves || []);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRec = attendances.find(a => a.date === todayStr);
      setTodayAttendance(todayRec || null);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDashboardData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/attendance/check-in');
      setMessage({ text: res.data.message || 'Check-in recorded!', type: 'success' });
      fetchEmployeeDashboardData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Check-in failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/attendance/check-out');
      setMessage({ text: res.data.message || 'Check-out recorded!', type: 'success' });
      fetchEmployeeDashboardData();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Check-out failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading personal attendance portal...</span>
      </div>
    );
  }

  const employee = user?.employee;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.firstName || 'User')}`}
            alt="Avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40 shadow-xl shadow-brand-500/10"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-outfit text-2xl font-bold text-white">
                Welcome back, {employee?.firstName}!
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-bold">
                {employee?.employeeCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {employee?.designation} • {employee?.department}
            </p>
          </div>
        </div>

        {/* Live Clock & Action Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[240px]">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 block">
            System Local Time
          </span>
          <span className="font-mono text-2xl font-extrabold text-white block mt-0.5">
            {currentTime.toLocaleTimeString()}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Message Feedback Banner */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {message.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Daily Check-In/Check-Out Interactive Widget */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-base text-slate-100">Today's Workday Attendance Action</h2>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
            todayAttendance?.checkOut
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : todayAttendance?.checkIn
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            Status: {todayAttendance?.status || 'NOT CHECKED IN'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Check-in Time:</span>
              <span className="font-mono font-bold text-slate-200">
                {todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : '—'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Check-out Time:</span>
              <span className="font-mono font-bold text-slate-200">
                {todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString() : '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckIn}
              disabled={!!todayAttendance || actionLoading}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {todayAttendance ? 'Already Checked In' : actionLoading ? 'Processing...' : 'Check In Now'}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={!todayAttendance || !!todayAttendance.checkOut || actionLoading}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-rose-600/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {todayAttendance?.checkOut ? 'Shift Completed' : actionLoading ? 'Processing...' : 'Check Out Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold">Attendance Rate</span>
          <div className="font-outfit text-3xl font-extrabold text-white">
            {attendanceSummary.attendancePercentage || 100}%
          </div>
          <p className="text-[11px] text-slate-500">Based on past {attendanceSummary.totalDays || 0} logged days</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold">Hours Logged</span>
          <div className="font-outfit text-3xl font-extrabold text-brand-400">
            {attendanceSummary.totalHours || 0} hrs
          </div>
          <p className="text-[11px] text-slate-500">Total verified shift hours</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold">Active Leaves</span>
          <div className="font-outfit text-3xl font-extrabold text-amber-400">
            {myLeaves.filter(l => l.status === 'PENDING').length} Pending
          </div>
          <p className="text-[11px] text-slate-500">{myLeaves.filter(l => l.status === 'APPROVED').length} Approved this year</p>
        </div>
      </div>

      {/* Salary Slips Preview Section */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">My Payslip Statements</h3>
          </div>
          <button
            onClick={() => navigate('/payroll')}
            className="text-xs text-brand-400 hover:underline font-semibold"
          >
            View All Statements
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {myPayrolls.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs">
              No payslip statements generated yet.
            </div>
          ) : (
            myPayrolls.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPayroll(p)}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{p.payPeriod}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {p.status}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white font-outfit">
                  ${p.netSalary.toLocaleString()}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                  <span>Days Worked: {p.attendanceDays}</span>
                  <span className="text-brand-400 group-hover:underline flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>View Slip</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        payroll={selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
      />
    </div>
  );
};
