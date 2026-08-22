import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Clock, 
  ShieldAlert, 
  CalendarOff, 
  DollarSign, 
  Users, 
  BarChart3, 
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  anomalyBadgeCount?: number;
  pendingLeavesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ anomalyBadgeCount = 0, pendingLeavesCount = 0 }) => {
  const { user } = useAuth();
  const isHr = user?.role === 'HR_ADMIN';

  const hrNavItems = [
    { label: 'HR Dashboard', path: '/hr-dashboard', icon: LayoutDashboard },
    { 
      label: 'AI Integrity Center', 
      path: '/integrity-center', 
      icon: ShieldAlert, 
      badge: anomalyBadgeCount > 0 ? anomalyBadgeCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      highlight: true
    },
    { label: 'Workforce Employees', path: '/employees', icon: Users },
    { label: 'Attendance Records', path: '/attendance', icon: Clock },
    { 
      label: 'Leave Approvals', 
      path: '/leaves', 
      icon: CalendarOff,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    { label: 'Payroll & Protection', path: '/payroll', icon: DollarSign },
    { label: 'HR Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Audit Trail Logs', path: '/audit-logs', icon: FileText },
  ];

  const employeeNavItems = [
    { label: 'My Dashboard', path: '/employee-dashboard', icon: LayoutDashboard },
    { label: 'Check-In & History', path: '/attendance', icon: Clock },
    { label: 'My Leave Requests', path: '/leaves', icon: CalendarOff },
    { label: 'My Salary Slips', path: '/payroll', icon: DollarSign },
    { label: 'My Profile', path: `/employees/${user?.employeeId || ''}`, icon: Users },
  ];

  const navItems = isHr ? hrNavItems : employeeNavItems;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-outfit text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                Dayflow
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400 block -mt-1">
                HRMS Engine
              </span>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 mx-4 my-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isHr ? 'bg-emerald-400 animate-ping' : 'bg-brand-400'}`} />
            <span className="text-xs font-semibold text-slate-300">
              {isHr ? 'HR & Payroll Admin' : 'Employee Portal'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
            {user?.employee?.employeeCode || 'SYS'}
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 space-y-1">
          <div className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  } ${item.highlight && !location.pathname.includes(item.path) ? 'border border-rose-500/30 bg-rose-500/5' : ''}`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {item.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Mini Summary */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <img
            src={user?.employee?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.employee?.firstName || user?.email || 'User')}&background=4f46e5&color=fff`}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.employee?.designation || user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
