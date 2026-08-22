import React, { useState } from 'react';
import { AttendanceAnomaly } from '../types';
import { ShieldAlert, CheckCircle, Edit3, HelpCircle, X, AlertTriangle } from 'lucide-react';

interface ReviewAnomalyModalProps {
  anomaly: AttendanceAnomaly | null;
  onClose: () => void;
  onSubmit: (data: { hrAction: string; hrNotes: string; correctedHours?: number; correctedStatus?: string }) => void;
}

export const ReviewAnomalyModal: React.FC<ReviewAnomalyModalProps> = ({ anomaly, onClose, onSubmit }) => {
  if (!anomaly) return null;

  const [hrAction, setHrAction] = useState<'APPROVED' | 'CORRECTED' | 'REQUESTED_EXPLANATION'>('APPROVED');
  const [hrNotes, setHrNotes] = useState('');
  const [correctedHours, setCorrectedHours] = useState<number>(8.0);
  const [correctedStatus, setCorrectedStatus] = useState<string>('PRESENT');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        hrAction,
        hrNotes,
        ...(hrAction === 'CORRECTED' && { correctedHours, correctedStatus })
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-100">AI Attendance Anomaly Review</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee & Risk Meter Summary */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={anomaly.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(anomaly.employee?.firstName || 'User')}`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-slate-700"
              />
              <div>
                <h4 className="font-semibold text-sm text-slate-200">
                  {anomaly.employee?.firstName} {anomaly.employee?.lastName}
                </h4>
                <p className="text-xs text-slate-400">
                  {anomaly.employee?.department} • {anomaly.employee?.employeeCode}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getRiskBadgeColor(anomaly.riskLevel)}`}>
                {anomaly.riskLevel} RISK ({anomaly.riskScore}%)
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Date: {anomaly.attendance?.date}</p>
            </div>
          </div>

          {/* Plain-Language AI Explanation Box */}
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>AI Anomaly Explanation</span>
            </div>
            <p className="text-slate-300 pl-5 leading-relaxed">
              {anomaly.reason}
            </p>
          </div>
        </div>

        {/* Action Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Select HR Decision Action
            </label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setHrAction('APPROVED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  hrAction === 'APPROVED'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve</span>
                <span className="text-[10px] text-slate-400 font-normal">Clear anomaly flag</span>
              </button>

              <button
                type="button"
                onClick={() => setHrAction('CORRECTED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  hrAction === 'CORRECTED'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span>Correct Record</span>
                <span className="text-[10px] text-slate-400 font-normal">Adjust hours/status</span>
              </button>

              <button
                type="button"
                onClick={() => setHrAction('REQUESTED_EXPLANATION')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  hrAction === 'REQUESTED_EXPLANATION'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>Ask Employee</span>
                <span className="text-[10px] text-slate-400 font-normal">Request explanation</span>
              </button>
            </div>
          </div>

          {/* Conditional Correction Inputs */}
          {hrAction === 'CORRECTED' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Corrected Work Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={correctedHours}
                  onChange={(e) => setCorrectedHours(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Corrected Status</label>
                <select
                  value={correctedStatus}
                  onChange={(e) => setCorrectedStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="HALF_DAY">HALF_DAY</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>
            </div>
          )}

          {/* HR Decision Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              HR Review Audit Notes / Justification
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide context or explanation for this decision (logged in audit trail)..."
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Submitting Review...' : 'Confirm Decision & Update Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
