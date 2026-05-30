import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Bell, Search, Filter, Calendar, Check, X, LogOut, 
  Users, Clock, AlertTriangle, FileText, ChevronRight, LayoutDashboard, Settings
} from 'lucide-react';

/**
 * AdminDashboard - Premium Corporate Overhaul
 * Redesigned for real-time analytics and dynamic interactions.
 */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
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
    <div className="flex h-screen bg-white overflow-hidden font-montserrat">
      {/* Sidebar Navigation Panel */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col z-20 shadow-xl">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">V</div>
            <h2 className="text-xl font-poppins font-bold tracking-tight">VR LMS</h2>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-4 font-montserrat">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<FileText size={20} />} label="Leave Requests" onClick={() => window.location.href='/admin/leave-requests'} />
          <NavItem icon={<Users size={20} />} label="Directory" />
          <NavItem icon={<Settings size={20} />} label="Admin Settings" />
        </nav>
        <div className="p-6 mt-auto border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center space-x-3 text-slate-400 hover:text-white transition-colors px-4 py-3">
            <LogOut size={20} />
            <span className="font-semibold font-montserrat">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-2xl font-poppins font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
              Welcome back, <span className="text-green-600">{user?.name}</span> • {user?.department}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-3 bg-gray-50 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all relative group"
              >
                {data?.notifications?.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20 animate-pulse"></span>
                )}
                <Bell size={22} />
              </button>
              
              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <span className="font-bold text-gray-900">Notifications</span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">{data?.notifications?.length} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {data?.notifications?.map(n => (
                      <div key={n.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors">
                        <p className="text-sm font-bold text-gray-900">{n.user_name} requested {n.type}</p>
                        <p className="text-xs text-gray-500 mt-1">{n.created_at}</p>
                      </div>
                    ))}
                    {data?.notifications?.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No new requests</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 pl-4 border-l border-gray-100">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{user?.role}</span>
              </div>
              <div className="h-12 w-12 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-green-500/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={logout} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-10">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Pending Approvals" value={data?.stats?.pending_approvals} icon={<Clock className="text-orange-500" />} color="orange" />
            <StatCard label="On Leave Today" value={data?.stats?.on_leave_today} icon={<Users className="text-blue-500" />} color="blue" />
            <StatCard label="Upcoming Next Week" value={data?.stats?.upcoming_next_week} icon={<Calendar className="text-green-500" />} color="green" />
            <StatCard label="Total Capacity" value={data?.stats?.total_capacity + '%'} icon={<AlertTriangle className="text-slate-500" />} color="slate" />
          </div>

          {/* Interactive Toolbar */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <select 
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
                >
                  <option value="">All Departments</option>
                  <option value="IT">IT Department</option>
                  <option value="HR">HR Department</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                  type="date" 
                  value={filters.date}
                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                  className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-green-500 transition-all" 
                />
              </div>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-semibold text-gray-700 w-80 focus:ring-2 focus:ring-green-500 transition-all shadow-inner" 
              />
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">Current Leave Applications</h3>
              <button className="flex items-center space-x-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
                <span>Detailed History</span>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">
                    <th className="px-8 py-5">Employee Detail</th>
                    <th className="px-8 py-5">Request Type</th>
                    <th className="px-8 py-5">Timeline</th>
                    <th className="px-8 py-5">Current Status</th>
                    <th className="px-8 py-5 text-right">Decision Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.applications?.data.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{req.user.name}</span>
                          <span className="text-xs text-gray-400 font-medium">{req.user.corporate_id} • {req.user.department}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{req.type}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col text-sm text-gray-600 font-medium">
                          <span>{req.start_date}</span>
                          <span className="text-[10px] text-gray-300">to</span>
                          <span>{req.end_date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusPill status={req.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleAction(req.id, 'approved')}
                              className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'declined')}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-xl mb-8 tracking-tight">Active Leave Distribution</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.department_distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                      {data?.department_distribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-xl mb-8 tracking-tight">Policy Insights</h3>
              <div className="space-y-6">
                <PolicyAlert 
                  title="Absence Warning" 
                  description={`${data?.stats?.policy_alerts || 0} departments showing irregular patterns.`} 
                  type="danger" 
                />
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Efficiency Tip</p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed font-medium">
                    Batch approvals typically reduce administrative overhead by <span className="text-green-600 font-bold">18%</span> per cycle.
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

const NavItem = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center space-x-4 p-4 rounded-2xl transition-all group ${
    active ? 'bg-green-600/10 text-green-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </a>
);

const StatCard = ({ label, value, icon, color }) => {
  const colorMap = {
    orange: 'from-orange-500/10 to-orange-500/5 text-orange-600 border-orange-100/50',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-100/50',
    green: 'from-green-500/10 to-green-500/5 text-green-600 border-green-100/50',
    red: 'from-red-500/10 to-red-500/5 text-red-600 border-red-100/50'
  };
  return (
    <div className={`p-8 rounded-[32px] border bg-gradient-to-br ${colorMap[color]} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
        <div className="h-1.5 w-8 bg-gray-200/50 rounded-full"></div>
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-black mt-2 tracking-tighter">{value || 0}</p>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    pending: 'bg-orange-100 text-orange-600 border-orange-200',
    approved: 'bg-green-100 text-green-600 border-green-200',
    declined: 'bg-red-100 text-red-600 border-red-200'
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const PolicyAlert = ({ title, description, type }) => (
  <div className={`p-6 border-l-[6px] rounded-2xl ${
    type === 'danger' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-orange-50 border-orange-500 text-orange-900'
  }`}>
    <p className="text-xs font-black uppercase tracking-widest mb-1">{title}</p>
    <p className="text-sm font-semibold opacity-80">{description}</p>
  </div>
);

export default AdminDashboard;
