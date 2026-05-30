import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './features/auth/components/LoginForm';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import LeaveRequests from './features/admin/pages/LeaveRequests';
import EmployeeDirectory from './features/admin/pages/EmployeeDirectory';
import CreateEmployee from './features/admin/pages/CreateEmployee';
import EmployeeDashboard from './features/employee/pages/EmployeeDashboard';
import { useAuth } from './features/auth/hooks/useAuth';

const ProtectedRoute = ({ children, isAdminRequired = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isAdminRequired && !isAdmin) return <Navigate to="/employee/dashboard" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute isAdminRequired={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/leave-requests" 
          element={
            <ProtectedRoute isAdminRequired={true}>
              <LeaveRequests />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/employees" 
          element={
            <ProtectedRoute isAdminRequired={true}>
              <EmployeeDirectory />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/employees/create" 
          element={
            <ProtectedRoute isAdminRequired={true}>
              <CreateEmployee />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
