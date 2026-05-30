import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

/**
 * AdminDashboard - Premium Corporate Overhaul
 * Redesigned for real-time analytics and dynamic interactions.
 */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    date: '',
    search: ''
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/dashboard?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
    // Simulate real-time by polling every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleAction = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/leave-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        // Optimistic UI update or just refetch
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  if (loading && !data) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-montserrat text-gray-900">
      <Sidebar logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <PageHeader 
          title="Dashboard Overview"
          subtitle="Real-time insights and analytics for your team."
          user={user}
          data={data}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
        />

        <div className="p-8 space-y-8">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Pending Approvals" value={data?.stats?.pending_approvals} />
            <StatCard label="On Leave Today" value={data?.stats?.on_leave_today} />
            <StatCard label="Upcoming Next Week" value={data?.stats?.upcoming_next_week} />
            <StatCard label="Total Capacity" value={data?.stats?.total_capacity + '%'} />
          </div>

          {/* Interactive Toolbar */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter size={16} className="absolute left-4 top-3.5 text-gray-400" />
                <select 
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  className="pl-10 pr-6 py-2.5 bg-gray-50 border-none rounded-lg text-xs font-semibold text-gray-700 focus:ring-1 focus:ring-green-500 transition-all cursor-pointer"
                >
                  <option value="">All Departments</option>
                  <option value="IT">IT Department</option>
                  <option value="HR">HR Department</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                  type="date" 
                  value={filters.date}
                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                  className="pl-10 pr-6 py-2.5 bg-gray-50 border-none rounded-lg text-xs font-semibold text-gray-700 focus:ring-1 focus:ring-green-500 transition-all" 
                />
              </div>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-6 py-2.5 bg-gray-50 border-none rounded-lg text-xs font-semibold text-gray-700 w-72 focus:ring-1 focus:ring-green-500 transition-all" 
              />
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight font-poppins">Current Leave Applications</h3>
              <button className="flex items-center space-x-2 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                <span>Detailed History</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Employee Detail</th>
                    <th className="px-8 py-4">Request Type</th>
                    <th className="px-8 py-4">Timeline</th>
                    <th className="px-8 py-4">Current Status</th>
                    <th className="px-8 py-4 text-right">Decision Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.applications?.data.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-sm">{req.user.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{req.user.corporate_id} • {req.user.department}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-semibold">{req.type}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col text-xs text-gray-600 font-medium">
                          <span>{req.start_date}</span>
                          <span className="text-[10px] text-gray-300">to</span>
                          <span>{req.end_date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <StatusPill status={req.status} />
                      </td>
                      <td className="px-8 py-5 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleAction(req.id, 'approved')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-all shadow-sm"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'declined')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all shadow-sm"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] font-semibold text-gray-300 uppercase italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg mb-6 tracking-tight font-poppins">Active Leave Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.department_distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={32}>
                      {data?.department_distribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg mb-6 tracking-tight font-poppins">Policy Insights</h3>
              <div className="space-y-4">
                <PolicyAlert 
                  title="Absence Warning" 
                  description={`${data?.stats?.policy_alerts || 0} departments showing irregular patterns.`} 
                  type="danger" 
                />
                <div className="p-5 bg-slate-50 rounded-lg">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Efficiency Tip</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                    Batch approvals typically reduce administrative overhead by <span className="text-green-600 font-semibold">18%</span> per cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ label, value }) => {
  return (
    <div className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-semibold text-gray-900 tracking-tight">{value || 0}</p>
      </div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    pending: 'bg-orange-50 text-orange-600 border-orange-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    declined: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const PolicyAlert = ({ title, description, type }) => (
  <div className={`p-5 border-l-4 rounded-lg ${
    type === 'danger' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-orange-50 border-orange-500 text-orange-900'
  }`}>
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1">{title}</p>
    <p className="text-xs font-medium opacity-80">{description}</p>
  </div>
);

export default AdminDashboard;
