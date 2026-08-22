import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuditLog } from '../types';
import { FileText, Search, ShieldCheck, Clock, UserCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (actionFilter !== 'ALL') params.action = actionFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white flex items-center space-x-2">
          <FileText className="w-6 h-6 text-violet-400" />
          <span>System Security & Action Audit Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete immutable audit trail for HR decisions, anomaly reviews, leave approvals, and payroll runs.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search audit details, actor name, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Actions</option>
            <option value="ANOMALY_REVIEWED">ANOMALY REVIEWED</option>
            <option value="LEAVE_APPROVED">LEAVE APPROVED</option>
            <option value="LEAVE_REJECTED">LEAVE REJECTED</option>
            <option value="PAYROLL_GENERATED">PAYROLL GENERATED</option>
            <option value="USER_LOGIN">USER LOGIN</option>
            <option value="USER_REGISTERED">USER REGISTERED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading audit log entries...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No matching audit logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Description & Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      <div className="flex items-center space-x-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                        <span>{log.actorName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold border border-violet-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{log.entity}</td>
                    <td className="p-4 text-slate-300 leading-normal">{log.details}</td>
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
