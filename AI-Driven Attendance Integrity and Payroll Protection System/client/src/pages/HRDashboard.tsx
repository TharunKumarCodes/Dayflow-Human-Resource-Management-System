import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LeaveRequest, AttendanceAnomaly } from '../types';
import { 
  Users, 
  Clock, 
  ShieldAlert, 
  CalendarOff, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  DollarSign
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [pendingAnomalies, setPendingAnomalies] = useState<AttendanceAnomaly[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, leavesRes, anomaliesRes] = await Promise.all([
        api.get('/analytics/hr'),
        api.get('/leaves/all?status=PENDING'),
        api.get('/anomalies?hrAction=NONE'),
      ]);

      setAnalytics(analyticsRes.data);
      setPendingLeaves(leavesRes.data.leaves || []);
      setPendingAnomalies(anomaliesRes.data.anomalies || []);
    } catch (err) {
      console.error('Failed to load HR dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveLeave = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/approve`, { hrComment: 'Approved via HR Dashboard' });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/reject`, { hrComment: 'Rejected via HR Dashboard' });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject leave');
    }
  };

  const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading workforce analytics & integrity status...</span>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner Alert if AI Attendance Anomalies are pending */}
      {pendingAnomalies.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-rose-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <span>AI Attendance Integrity Warning</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono">
                  {pendingAnomalies.length} Flagged
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingAnomalies.length} attendance record(s) flagged with high anomaly risk requiring Human-In-The-Loop HR clearance before payroll processing.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/integrity-center')}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center space-x-1.5 flex-shrink-0"
          >
            <span>Review Integrity Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Workforce</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-outfit text-3xl font-extrabold text-white">{kpis.totalEmployees || 0}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Across all departments</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Today</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-outfit text-3xl font-extrabold text-white">{kpis.activeTodayCount || 0}</span>
            <span className="text-xs text-emerald-400 font-semibold">
              {kpis.attendanceRateToday || 0}% Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Checked-in & working shift</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Anomalies Flagged</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-outfit text-3xl font-extrabold text-rose-400">{kpis.unreviewedAnomaliesCount || 0}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Needs Review
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Holding payroll adjustment</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Leaves</span>
            <CalendarOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-outfit text-3xl font-extrabold text-white">{kpis.pendingLeaveCount || 0}</span>
            <span className="text-xs text-amber-400 font-semibold">Requests</span>
          </div>
          <p className="text-[11px] text-slate-500">Awaiting HR decision</p>
        </div>
      </div>

      {/* Main Charts & Approval Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Workforce & Payroll Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Department Workforce Distribution</h3>
              <p className="text-xs text-slate-400">Headcount & estimated basic payroll allocation</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-brand-400 hover:underline font-semibold flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentStats || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="employees" fill="#6366f1" radius={[6, 6, 0, 0]} name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Leave Approvals Widget */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarOff className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Pending Leave Approvals</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {pendingLeaves.length}
              </span>
            </div>

            <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
              {pendingLeaves.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No pending leave requests to review.
                </div>
              ) : (
                pendingLeaves.map((leave) => (
                  <div key={leave.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between font-semibold text-slate-200">
                      <span>{leave.employee?.firstName} {leave.employee?.lastName}</span>
                      <span className="text-amber-400 font-mono">{leave.totalDays} Day(s)</span>
                    </div>
                    <p className="text-slate-400 line-clamp-1">{leave.reason}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/leaves')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors text-center"
          >
            Manage All Leave Requests
          </button>
        </div>
      </div>
    </div>
  );
};
