import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

/**
 * AdminDashboard - Enhanced corporate view inspired by Dashboard.png
 * Skill: Component Architecture & UI/UX
 */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json',
          },
        });
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Workspace...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Navigation Panel */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-green-600">VR LMS Console</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg font-medium">
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <span>Leave Requests</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <span>Employee Directory</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <span>Policy Settings</span>
          </a>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-100">
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-green-700 transition-all">
            + New Request
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administrative Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name} | {user?.department}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              🔔
            </button>
            <div className="h-10 w-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold border border-green-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-red-600">Logout</button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Top KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Pending Approvals', value: data?.stats?.pending_approvals, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'On Leave Today', value: data?.stats?.on_leave_today, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Employees', value: data?.stats?.total_employees, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Policy Alerts', value: data?.stats?.policy_alerts, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((stat, i) => (
              <div key={i} className={`p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow`}>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-green-500 focus:border-green-500">
                <option>All Departments</option>
                {data?.department_distribution.map(d => <option key={d.name}>{d.name}</option>)}
              </select>
              <input type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
            </div>
            <div className="relative">
              <input type="text" placeholder="Search employee..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 w-64" />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Main Data Grid */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Current Leave Applications</h3>
              <button className="text-sm text-green-600 font-medium hover:underline">View All Records</button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recent_requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{req.employee}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{req.type}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{req.start_date} → {req.end_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                        req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-green-600 px-2 font-bold">✓</button>
                      <button className="text-gray-400 hover:text-red-600 px-2 font-bold">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Analytical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Leave Distribution by Department</h3>
              <div className="flex items-end space-x-6 h-48 px-4">
                {data?.department_distribution.map((dept, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="w-full bg-green-500 rounded-t-lg transition-all group-hover:bg-green-600" 
                      style={{ height: `${(dept.count / 15) * 100}%` }}
                    ></div>
                    <span className="text-[10px] mt-2 font-bold text-gray-500 uppercase">{dept.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Policy Alerts</h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-xs font-bold text-red-800 uppercase">Excessive Absences</p>
                  <p className="text-sm text-red-700 mt-1">3 employees have exceeded sick leave threshold.</p>
                </div>
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                  <p className="text-xs font-bold text-orange-800 uppercase">Overlap Warning</p>
                  <p className="text-sm text-orange-700 mt-1">Finance dept has 4 people on leave next week.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
