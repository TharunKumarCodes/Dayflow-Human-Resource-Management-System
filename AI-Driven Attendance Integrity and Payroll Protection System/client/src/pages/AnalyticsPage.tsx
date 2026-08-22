import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp, Users, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/hr');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
  const RISK_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Generating workforce intelligence charts...</div>;
  }

  const statusData = analytics?.statusCounts ? [
    { name: 'PRESENT', value: analytics.statusCounts.PRESENT || 0 },
    { name: 'LATE', value: analytics.statusCounts.LATE || 0 },
    { name: 'HALF DAY', value: analytics.statusCounts.HALF_DAY || 0 },
    { name: 'LEAVE', value: analytics.statusCounts.LEAVE || 0 },
    { name: 'ABSENT', value: analytics.statusCounts.ABSENT || 0 },
  ] : [];

  const riskData = analytics?.riskDistribution ? [
    { name: 'HIGH RISK', value: analytics.riskDistribution.HIGH || 0, color: '#ef4444' },
    { name: 'MEDIUM RISK', value: analytics.riskDistribution.MEDIUM || 0, color: '#f59e0b' },
    { name: 'LOW RISK', value: analytics.riskDistribution.LOW || 0, color: '#10b981' },
  ] : [];

  const leaveData = analytics?.leaveBreakdown ? [
    { name: 'PAID', count: analytics.leaveBreakdown.PAID || 0 },
    { name: 'SICK', count: analytics.leaveBreakdown.SICK || 0 },
    { name: 'UNPAID', count: analytics.leaveBreakdown.UNPAID || 0 },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-brand-400" />
          <span>Workforce & AI Anomaly Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactive workforce distribution metrics, risk patterns, and department analytics.
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Status Distribution */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            <span>Attendance Status Breakdown</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Anomaly Risk Distribution */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>AI Anomaly Risk Profile</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Payroll Breakdown */}
        <div className="md:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Department Base Salary Allocation ($)</span>
          </h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.departmentStats || []}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="totalSalary" fill="#10b981" radius={[6, 6, 0, 0]} name="Total Department Base Salary ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
