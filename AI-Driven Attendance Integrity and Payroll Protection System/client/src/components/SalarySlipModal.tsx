import React from 'react';
import { Payroll } from '../types';
import { Download, Printer, X, Sparkles, ShieldCheck } from 'lucide-react';

interface SalarySlipModalProps {
  payroll: Payroll | null;
  onClose: () => void;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({ payroll, onClose }) => {
  if (!payroll) return null;

  const employee = payroll.employee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative text-slate-100 my-8">
        {/* Action Bar (Not visible in print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h2 className="font-outfit text-xl font-bold text-slate-100">Salary Slip Statement</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Document Container */}
        <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-800/80">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white">
                  D
                </div>
                <span className="font-outfit text-2xl font-extrabold tracking-tight text-white">
                  Dayflow Inc.
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Human Capital & Payroll Protection Systems</p>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Official Pay Advice
              </span>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                Pay Period: {payroll.payPeriod}
              </p>
            </div>
          </div>

          {/* Employee & Payroll Metadata Table */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Employee Details</p>
              <p className="font-bold text-slate-200 text-sm mt-0.5">
                {employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'}
              </p>
              <p className="text-slate-400">Employee ID: <span className="font-mono text-slate-300">{employee?.employeeCode}</span></p>
              <p className="text-slate-400">Department: {employee?.department}</p>
              <p className="text-slate-400">Designation: {employee?.designation}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-semibold uppercase text-[10px]">Payment Summary</p>
              <p className="text-slate-400 mt-0.5">Status: <span className="font-bold text-emerald-400">{payroll.status}</span></p>
              <p className="text-slate-400">Verified Days Worked: <span className="font-semibold text-slate-200">{payroll.attendanceDays} days</span></p>
              <p className="text-slate-400">Anomaly Hold Count: <span className="font-semibold text-slate-200">{payroll.anomalyHoldCount}</span></p>
              <p className="text-slate-400">Generated: {new Date(payroll.generatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Component Description</th>
                  <th className="p-3 text-right">Earnings ($)</th>
                  <th className="p-3 text-right">Deductions ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="p-3 text-slate-300">Basic Monthly Base Salary</td>
                  <td className="p-3 text-right font-mono text-slate-200">${payroll.basicSalary.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300">HRA & Fixed Allowances</td>
                  <td className="p-3 text-right font-mono text-slate-200">${payroll.allowances.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-slate-500">—</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300">Tax Withholdings & Statutory PF</td>
                  <td className="p-3 text-right font-mono text-slate-500">—</td>
                  <td className="p-3 text-right font-mono text-rose-400">${payroll.deductions.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-900/40 font-bold border-t border-slate-800">
                  <td className="p-3 text-slate-200">Gross Total Earnings</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${payroll.grossSalary.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-rose-400">${payroll.deductions.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="bg-gradient-to-r from-brand-900/40 via-indigo-900/30 to-violet-900/40 border border-brand-500/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-brand-300 tracking-wider">Total Net Payable Salary</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Cleared after Human-in-the-Loop Attendance Verification</p>
            </div>
            <div className="text-right">
              <span className="font-outfit text-3xl font-extrabold text-white">
                ${payroll.netSalary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified & Protection Cleared by HR Payroll Integrity Engine</span>
            </div>
            <div>Computer generated statement — no signature required.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
