import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HRDashboard } from './pages/HRDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AttendancePage } from './pages/AttendancePage';
import { AnomalyIntegrityCenter } from './pages/AnomalyIntegrityCenter';
import { LeaveManagementPage } from './pages/LeaveManagementPage';
import { PayrollPage } from './pages/PayrollPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Protected Route Guard Wrapper
const ProtectedLayout: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Authenticating Dayflow session...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect employee to their dashboard if trying to access HR-only route
    return <Navigate to="/employee-dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Pages */}
      <Route element={<ProtectedLayout />}>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves" element={<LeaveManagementPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/employees/:id" element={<EmployeeProfilePage />} />
      </Route>

      {/* HR Admin Restricted Pages */}
      <Route element={<ProtectedLayout allowedRoles={['HR_ADMIN']} />}>
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/integrity-center" element={<AnomalyIntegrityCenter />} />
        <Route path="/employees" element={<AttendancePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
