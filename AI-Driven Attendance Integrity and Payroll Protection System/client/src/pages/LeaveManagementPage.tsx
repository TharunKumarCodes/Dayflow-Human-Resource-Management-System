import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LeaveRequest } from '../types';
import { CalendarOff, Plus, CheckCircle, XCircle, Clock, Filter, AlertCircle } from 'lucide-react';

export const LeaveManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR_ADMIN';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form State
  const [type, setType] = useState<'PAID' | 'SICK' | 'UNPAID'>('PAID');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // HR Review Comment State
  const [reviewComment, setReviewComment] = useState<{ [id: string]: string }>({});

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const endpoint = isHr ? '/leaves/all' : '/leaves/my';
      const params: any = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;

      const res = await api.get(endpoint, { params });
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/leaves', { type, startDate, endDate, reason });
      setShowApplyModal(false);
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchLeaves();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/approve`, { hrComment: reviewComment[id] || 'Approved' });
      fetchLeaves();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/leaves/${id}/reject`, { hrComment: reviewComment[id] || 'Rejected' });
      fetchLeaves();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">APPROVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">PENDING</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white flex items-center space-x-2">
            <CalendarOff className="w-6 h-6 text-amber-400" />
            <span>{isHr ? 'Workforce Leave Approvals' : 'My Leave Requests'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isHr ? 'Approve or reject employee leave applications with comments.' : 'Apply for time off and track request status.'}
          </p>
        </div>

        {!isHr && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-brand-600/20 hover:brightness-110 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Time Off</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-300">Status Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Requests</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div className="text-slate-400">
          Total: <span className="text-white font-bold">{leaves.length}</span> request(s)
        </div>
      </div>

      {/* Leave Requests Table / Cards */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  {isHr && <th className="p-4">Employee</th>}
                  <th className="p-4">Leave Type</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Total Days</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  {isHr && <th className="p-4">HR Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/40 transition-colors">
                    {isHr && (
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={leave.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employee?.firstName || 'User')}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border border-slate-700"
                          />
                          <div>
                            <p className="font-semibold text-slate-200">
                              {leave.employee?.firstName} {leave.employee?.lastName}
                            </p>
                            <span className="text-[10px] text-slate-400">{leave.employee?.department}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="p-4 font-bold text-slate-300">{leave.type} LEAVE</td>
                    <td className="p-4 font-mono text-slate-300">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold font-mono text-amber-400">{leave.totalDays} Day(s)</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{leave.reason}</td>
                    <td className="p-4">{getStatusBadge(leave.status)}</td>
                    {isHr && (
                      <td className="p-4">
                        {leave.status === 'PENDING' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="HR comment..."
                              value={reviewComment[leave.id] || ''}
                              onChange={(e) => setReviewComment({ ...reviewComment, [leave.id]: e.target.value })}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200"
                            />
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">{leave.hrComment || 'Reviewed'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Apply for Time Off</h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Leave Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="PAID">PAID LEAVE</option>
                  <option value="SICK">SICK LEAVE</option>
                  <option value="UNPAID">UNPAID LEAVE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={3}
                  placeholder="State clear purpose..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
