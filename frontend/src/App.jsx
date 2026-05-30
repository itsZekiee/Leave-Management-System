import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './features/auth/components/LoginForm';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import LeaveRequests from './features/admin/pages/LeaveRequests';
import { useAuth } from './features/auth/hooks/useAuth';

const ProtectedRoute = ({ children, isAdminRequired = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isAdminRequired && !isAdmin) return <Navigate to="/employee/dashboard" />;

  return children;
};

const EmployeePlaceholder = () => (
  <div className="flex flex-col h-screen items-center justify-center bg-gray-50 text-center p-8">
    <h1 className="text-3xl font-bold text-gray-800">Employee Workspace</h1>
    <p className="mt-4 text-gray-600 max-w-md">The Employee view is scheduled for the next sprint. Please check back later for your leave requests and profile management.</p>
    <button onClick={() => window.location.href='/login'} className="mt-8 text-green-600 font-semibold underline">Back to Login</button>
  </div>
);

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
          path="/employee/dashboard" 
          element={
            <ProtectedRoute>
              <EmployeePlaceholder />
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
