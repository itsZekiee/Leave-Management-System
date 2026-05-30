import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Bell, Search, Filter, Calendar, Check, X, LogOut, 
  Users, Clock, AlertTriangle, FileText, ChevronRight, LayoutDashboard, Settings,
  HelpCircle, ShieldCheck, PlusCircle
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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
      {/* Sidebar Navigation Panel */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col z-20">
        <div className="p-8">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-poppins font-black text-gray-900 tracking-tight">VR-LMS Admin</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Management Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarLink 
            to="/admin/dashboard" 
            icon={<LayoutDashboard size={22}/>} 
            label="Dashboard" 
            active={location.pathname === '/admin/dashboard'} 
          />
          <SidebarLink 
            to="/admin/leave-requests" 
            icon={<FileText size={22} />} 
            label="Leave Requests" 
            active={location.pathname === '/admin/leave-requests'} 
          />
          <SidebarLink icon={<Calendar size={22} />} label="Team Calendar" />
          <SidebarLink icon={<Users size={22} />} label="Employee Directory" />
          <SidebarLink icon={<Settings size={22} />} label="Admin Settings" />
        </nav>

        <div className="p-6 space-y-6">
          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2">
            <span className="text-xl">+</span>
            <span>New Request</span>
          </button>

          <div className="space-y-2 pt-4 border-t border-gray-50">
            <SecondaryNavLink icon={<HelpCircle size={20} />} label="Help Center" />
            <SecondaryNavLink icon={<ShieldCheck size={20} />} label="Privacy Policy" />
            <button onClick={logout} className="w-full flex items-center space-x-4 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors group">
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header */}
        <header className="bg-white px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-2xl font-poppins font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
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
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="User Avatar" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-10">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Pending Approvals" value={data?.stats?.pending_approvals} />
            <StatCard label="On Leave Today" value={data?.stats?.on_leave_today} />
            <StatCard label="Upcoming Next Week" value={data?.stats?.upcoming_next_week} />
            <StatCard label="Total Capacity" value={data?.stats?.total_capacity + '%'} />
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

const SidebarLink = ({ to, icon, label, active = false }) => {
  const content = (
    <>
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </>
  );

  const baseClasses = `flex items-center space-x-4 px-6 py-4 rounded-xl transition-all group`;
  const activeClasses = `bg-green-50 text-green-600 border-r-4 border-green-600 rounded-r-none`;
  const inactiveClasses = `text-gray-400 hover:bg-gray-50 hover:text-gray-900`;

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <button className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      {content}
    </button>
  );
};

const SecondaryNavLink = ({ icon, label }) => (
  <button className="w-full flex items-center space-x-4 px-4 py-3 text-gray-400 hover:text-gray-900 transition-colors group">
    <div className="group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-sm font-bold text-gray-400 mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-5xl font-black text-gray-900 tracking-tighter">{value || 0}</p>
      </div>
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
