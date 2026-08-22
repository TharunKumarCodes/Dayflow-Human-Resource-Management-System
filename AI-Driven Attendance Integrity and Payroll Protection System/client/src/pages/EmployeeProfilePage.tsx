import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Employee, Document } from '../types';
import { Users, Mail, Phone, MapPin, Building, Briefcase, DollarSign, FileText, Upload, Edit, Save, X, ShieldCheck } from 'lucide-react';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHr = user?.role === 'HR_ADMIN';

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [formData, setFormData] = useState<any>({});
  
  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [addingDoc, setAddingDoc] = useState(false);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const targetId = id || user?.employeeId;
      if (!targetId) return;

      const res = await api.get(`/employees/${targetId}`);
      setEmployee(res.data.employee);
      setFormData(res.data.employee);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const targetId = id || user?.employeeId;
      const res = await api.put(`/employees/${targetId}`, formData);
      setEmployee(res.data.employee);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    try {
      const targetId = id || user?.employeeId;
      await api.post(`/employees/${targetId}/documents`, {
        title: docTitle,
        fileType: 'PDF',
        fileUrl: docUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      });
      setDocTitle('');
      setDocUrl('');
      setAddingDoc(false);
      fetchEmployee();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add document');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading employee profile...</div>;
  }

  if (!employee) {
    return <div className="p-12 text-center text-slate-500 text-xs">Employee profile not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Profile Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.firstName)}`}
            alt="Avatar"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500/40 shadow-xl"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-outfit text-2xl font-bold text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-bold">
                {employee.employeeCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {employee.designation} • {employee.department}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Joined {new Date(employee.dateOfJoining).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition-colors"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Profile Form / View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSaveProfile} className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-100 pb-3 border-b border-slate-800">
            Personal & Job Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">First Name</label>
              <input
                type="text"
                disabled={!isHr || !isEditing}
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Last Name</label>
              <input
                type="text"
                disabled={!isHr || !isEditing}
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department</label>
              <input
                type="text"
                disabled={!isHr || !isEditing}
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Designation</label>
              <input
                type="text"
                disabled={!isHr || !isEditing}
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Avatar Image URL</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.avatarUrl || ''}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1">Residential Address</label>
            <textarea
              rows={2}
              disabled={!isEditing}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 disabled:opacity-60"
            />
          </div>

          {/* Salary Structure (HR Editable Only) */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="font-semibold text-xs text-brand-400 uppercase tracking-wider">Salary Structure ($)</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Basic Base Salary</label>
                <input
                  type="number"
                  disabled={!isHr || !isEditing}
                  value={formData.basicSalary || 0}
                  onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Monthly Allowances</label>
                <input
                  type="number"
                  disabled={!isHr || !isEditing}
                  value={formData.allowances || 0}
                  onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Standard Deductions</label>
                <input
                  type="number"
                  disabled={!isHr || !isEditing}
                  value={formData.deductions || 0}
                  onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 disabled:opacity-60 font-mono"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-brand-600/20 hover:brightness-110 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </form>

        {/* Documents Section */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-slate-100">Employee Documents</h3>
            </div>
            <button
              onClick={() => setAddingDoc(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Add Document"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            {employee.documents?.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No uploaded documents.</div>
            ) : (
              employee.documents?.map((doc) => (
                <div key={doc.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span className="font-medium text-slate-200 truncate">{doc.title}</span>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-400 hover:underline font-semibold"
                  >
                    Download
                  </a>
                </div>
              ))
            )}
          </div>

          {/* Add Doc Form */}
          {addingDoc && (
            <form onSubmit={handleAddDocument} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200">Upload New Record Document</h4>
              <input
                type="text"
                required
                placeholder="Document Title (e.g. Passport Proof.pdf)"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setAddingDoc(false)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold">
                  Save Doc
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
