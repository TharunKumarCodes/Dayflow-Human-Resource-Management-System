import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AttendanceAnomaly } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  HelpCircle,
  BrainCircuit,
  Lock,
  Sparkles
} from 'lucide-react';
import { ReviewAnomalyModal } from '../components/ReviewAnomalyModal';

export const AnomalyIntegrityCenter: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AttendanceAnomaly[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [hrActionFilter, setHrActionFilter] = useState('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AttendanceAnomaly | null>(null);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (riskLevel !== 'ALL') params.riskLevel = riskLevel;
      if (hrActionFilter !== 'ALL') params.hrAction = hrActionFilter;

      const res = await api.get('/anomalies', { params });
      setAnomalies(res.data.anomalies || []);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [riskLevel, hrActionFilter]);

  const handleReviewSubmit = async (data: { hrAction: string; hrNotes: string; correctedHours?: number; correctedStatus?: string }) => {
    if (!selectedAnomaly) return;
    try {
      await api.put(`/anomalies/${selectedAnomaly.id}/review`, data);
      setSelectedAnomaly(null);
      fetchAnomalies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const getRiskMeterColor = (score: number) => {
    if (score >= 60) return 'bg-rose-500 text-rose-200 border-rose-500/40';
    if (score >= 35) return 'bg-amber-500 text-amber-200 border-amber-500/40';
    return 'bg-emerald-500 text-emerald-200 border-emerald-500/40';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <BrainCircuit className="w-4 h-4 text-brand-400" />
            <span>Explainable AI Risk Engine & Payroll Protection</span>
          </div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">
            AI Attendance Integrity Center
          </h1>
          <p className="text-xs text-slate-400">
            Human-in-the-Loop review portal for flagged attendance anomalies before payroll calculation.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-4 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Payroll Protection</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Strict Governance Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-300">Filters:</span>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">HIGH Risk (≥60%)</option>
            <option value="MEDIUM">MEDIUM Risk (35-59%)</option>
            <option value="LOW">LOW Risk (&lt;35%)</option>
          </select>

          <select
            value={hrActionFilter}
            onChange={(e) => setHrActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="NONE">Pending HR Review</option>
            <option value="APPROVED">Approved by HR</option>
            <option value="CORRECTED">Corrected by HR</option>
            <option value="REQUESTED_EXPLANATION">Explanation Requested</option>
          </select>
        </div>

        <div className="text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{anomalies.length}</span> anomaly record(s)
        </div>
      </div>

      {/* Anomalies List / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Running rule-based anomaly risk analysis...
        </div>
      ) : anomalies.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs space-y-2">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <p className="font-bold text-slate-200 text-sm">No Unresolved Anomalies Found</p>
          <p>All attendance records have passed integrity checks or have been reviewed by HR.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((item) => (
            <div
              key={item.id}
              className={`glass-card p-5 rounded-2xl border transition-all ${
                item.hrAction === 'NONE'
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Employee Info & Risk Score */}
                <div className="flex items-start space-x-3">
                  <img
                    src={item.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employee?.firstName || 'User')}`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-100">
                        {item.employee?.firstName} {item.employee?.lastName}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.employee?.employeeCode}
                      </span>
                      <span className="text-xs text-slate-400">• {item.employee?.department}</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Attendance Date: <span className="font-mono text-slate-200 font-bold">{item.attendance?.date}</span> (Check-in: {item.attendance?.checkIn ? new Date(item.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}, Shift: {item.attendance?.workHours.toFixed(1)} hrs)
                    </p>
                  </div>
                </div>

                {/* Risk Score Meter & Action Button */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`text-xs px-3 py-1 rounded-full font-extrabold border ${getRiskMeterColor(item.riskScore)}`}>
                      {item.riskLevel} RISK ({item.riskScore}%)
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {item.hrAction === 'NONE' ? 'Payroll Hold Active' : `Reviewed by ${item.reviewedBy}`}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedAnomaly(item)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                      item.hrAction === 'NONE'
                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {item.hrAction === 'NONE' ? 'Review & Protect' : 'Edit Review'}
                  </button>
                </div>
              </div>

              {/* Plain Language Explanation Box */}
              <div className="mt-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px]">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Explainable AI Risk Reason</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  {item.reason}
                </p>
              </div>

              {/* HR Review Decision Result if reviewed */}
              {item.hrAction !== 'NONE' && (
                <div className="mt-3 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-slate-400">
                  <span>Decision: <strong className="text-slate-200">{item.hrAction}</strong></span>
                  {item.hrNotes && <span>Notes: <em>"{item.hrNotes}"</em></span>}
                  <span>Reviewed: {new Date(item.reviewedAt!).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <ReviewAnomalyModal
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};
