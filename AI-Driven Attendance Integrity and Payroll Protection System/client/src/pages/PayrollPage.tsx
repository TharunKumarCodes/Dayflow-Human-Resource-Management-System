import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Payroll } from '../types';
import { DollarSign, ShieldAlert, FileText, RefreshCw, CheckCircle, Lock } from 'lucide-react';
import { SalarySlipModal } from '../components/SalarySlipModal';

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR_ADMIN';

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [payPeriod, setPayPeriod] = useState('August 2026');

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const endpoint = isHr ? '/payroll/all' : '/payroll/my';
      const res = await api.get(endpoint);
      setPayrolls(isHr ? res.data.payrolls : res.data.payrolls);
      if (res.data.meta) setMeta(res.data.meta);
    } catch (err) {
      console.error('Failed to fetch payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/payroll/generate', { payPeriod });
      alert(res.data.message);
      fetchPayroll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payroll generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/payroll/${id}/status`, { status });
      fetchPayroll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>{isHr ? 'Workforce Payroll & Protection Hub' : 'My Salary Slips'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isHr ? 'Manage salary calculations guarded by HR attendance anomaly clearance.' : 'View monthly pay statements and download printable salary slips.'}
          </p>
        </div>

        {isHr && (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
            />
            <button
              onClick={handleGeneratePayroll}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:brightness-110 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Calculating...' : 'Run Payroll Calculation'}</span>
            </button>
          </div>
        )}
      </div>

      {/* HR Summary Meta Bar */}
      {isHr && meta.totalPayout !== undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 uppercase font-semibold">Total Net Payout</span>
            <div className="font-outfit text-2xl font-extrabold text-white mt-1">
              ${meta.totalPayout.toLocaleString()}
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 uppercase font-semibold">Total Records</span>
            <div className="font-outfit text-2xl font-extrabold text-brand-400 mt-1">
              {meta.totalRecords}
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 uppercase font-semibold">Anomaly Holds Active</span>
            <div className="font-outfit text-2xl font-extrabold text-rose-400 mt-1 flex items-center space-x-2">
              <span>{meta.unreviewedAnomalyHolds} Holds</span>
              {meta.unreviewedAnomalyHolds > 0 && <Lock className="w-4 h-4 text-rose-400" />}
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading payroll data...</div>
        ) : payrolls.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No payroll records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  {isHr && <th className="p-4">Employee</th>}
                  <th className="p-4">Pay Period</th>
                  <th className="p-4">Basic Base</th>
                  <th className="p-4">Allowances</th>
                  <th className="p-4">Deductions</th>
                  <th className="p-4">Net Salary</th>
                  <th className="p-4">Anomaly Holds</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Salary Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {isHr && (
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={p.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.employee?.firstName || 'User')}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border border-slate-700"
                          />
                          <div>
                            <p className="font-semibold text-slate-200">
                              {p.employee?.firstName} {p.employee?.lastName}
                            </p>
                            <span className="text-[10px] text-slate-400">{p.employee?.department}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4 font-bold text-slate-300">{p.payPeriod}</td>
                    <td className="p-4 font-mono text-slate-300">${p.basicSalary.toLocaleString()}</td>
                    <td className="p-4 font-mono text-slate-300">${p.allowances.toLocaleString()}</td>
                    <td className="p-4 font-mono text-rose-400">${p.deductions.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">${p.netSalary.toLocaleString()}</td>
                    <td className="p-4 font-mono">
                      {p.anomalyHoldCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center space-x-1 w-fit">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{p.anomalyHoldCount} Hold</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">0 Cleared</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isHr ? (
                        <select
                          value={p.status}
                          onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSED">PROCESSED</option>
                          <option value="PAID">PAID</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedPayroll(p)}
                        className="px-3 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30 font-semibold text-[11px] flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Slip Modal */}
      <SalarySlipModal
        payroll={selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
      />
    </div>
  );
};
