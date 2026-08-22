import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Attendance } from '../types';
import { Clock, Filter, ShieldAlert, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR_ADMIN';

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const endpoint = isHr ? '/attendance/all' : '/attendance/my';
      const params: any = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (flaggedOnly) params.flaggedOnly = 'true';

      const res = await api.get(endpoint, { params });
      setAttendances(isHr ? res.data.attendances : res.data.attendances);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filterStatus, flaggedOnly]);

  const filteredAttendances = attendances.filter((att) => {
    if (!searchTerm) return true;
    const name = att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : '';
    const code = att.employee?.employeeCode || '';
    const date = att.date || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           date.includes(searchTerm);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">PRESENT</span>;
      case 'LATE':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">LATE</span>;
      case 'HALF_DAY':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">HALF DAY</span>;
      case 'LEAVE':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">LEAVE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">ABSENT</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-6 h-6 text-brand-400" />
            <span>{isHr ? 'Workforce Attendance Register' : 'My Attendance History'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isHr ? 'Track daily check-ins, shift durations, and flagged AI anomaly scores.' : 'View daily check-in times and total working hours.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, employee ID, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="LATE">LATE</option>
            <option value="HALF_DAY">HALF DAY</option>
            <option value="LEAVE">LEAVE</option>
            <option value="ABSENT">ABSENT</option>
          </select>

          {isHr && (
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="rounded border-slate-700 text-brand-500 focus:ring-0 bg-slate-900"
              />
              <span className="text-rose-400 font-semibold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>AI Flagged Only</span>
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading attendance records...
          </div>
        ) : filteredAttendances.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No attendance records match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Date</th>
                  {isHr && <th className="p-4">Employee</th>}
                  <th className="p-4">Check-In</th>
                  <th className="p-4">Check-Out</th>
                  <th className="p-4">Hours Logged</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">AI Risk Score</th>
                  <th className="p-4">HR Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-300 font-semibold">{att.date}</td>
                    {isHr && (
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={att.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(att.employee?.firstName || 'User')}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border border-slate-700"
                          />
                          <div>
                            <p className="font-semibold text-slate-200">
                              {att.employee?.firstName} {att.employee?.lastName}
                            </p>
                            <span className="text-[10px] text-slate-400">{att.employee?.department}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4 font-mono text-slate-200">
                      {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="p-4 font-mono text-slate-200">
                      {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-100">{att.workHours.toFixed(1)} hrs</td>
                    <td className="p-4">{getStatusBadge(att.status)}</td>
                    <td className="p-4">
                      {att.riskScore >= 35 ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{att.riskScore}% Risk</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">{att.riskScore}%</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[11px] font-semibold ${
                        att.hrReviewStatus === 'APPROVED' ? 'text-emerald-400' :
                        att.hrReviewStatus === 'CORRECTED' ? 'text-indigo-400' :
                        att.hrReviewStatus === 'REQUESTED_EXPLANATION' ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {att.hrReviewStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
