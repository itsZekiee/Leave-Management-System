import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle, AlertCircle,
  ArrowRight, Info, Bell, User as UserIcon, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/employee/dashboard`, {
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
        console.error('Failed to fetch employee dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-montserrat text-gray-900">
      {/* Employee Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg text-white">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-lg font-poppins font-semibold text-gray-900">LMS Employee</h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Personal Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900">{user?.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">{user?.corporate_id}</p>
              </div>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=4CAF50&color=fff`}
                alt="Profile"
                className="w-9 h-9 rounded-full border border-gray-100"
              />
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 transition-all">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Block */}
        <section>
          <h2 className="text-2xl font-poppins font-semibold text-gray-900">Welcome back, {user?.name.split(' ')[0]}!</h2>
          <p className="text-sm text-gray-500 mt-1">Here's an overview of your leave status and upcoming company events.</p>
        </section>

        {/* KPI Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard title="Vacation Leave" balance={data?.leave_balances.vacation} color="green" icon={<Calendar size={24} />} />
          <BalanceCard title="Sick Leave" balance={data?.leave_balances.sick} color="blue" icon={<Clock size={24} />} />
          <BalanceCard title="Emergency Leave" balance={data?.leave_balances.emergency} color="orange" icon={<AlertCircle size={24} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-poppins font-semibold text-gray-900 uppercase tracking-wider">Recent Applications</h3>
              <button className="text-xs font-bold text-green-600 hover:underline">View All History</button>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Dates</th>
                    <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.history.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400 text-xs italic">No recent applications found.</td>
                    </tr>
                  ) : (
                    data?.history.map((leave) => (
                      <tr key={leave.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-700">{leave.leave_type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-500">{leave.start_date} - {leave.end_date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={leave.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="space-y-4">
            <h3 className="text-sm font-poppins font-semibold text-gray-900 uppercase tracking-wider">Company Bulletins</h3>
            <div className="space-y-3">
              {data?.alerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-lg border flex gap-3 ${
                  alert.type === 'warning' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
                }`}>
                  <div className={alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'}>
                    {alert.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{alert.title}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{alert.body}</p>
                  </div>
                </div>
              ))}
              <div className="bg-green-600 rounded-lg p-6 text-white shadow-lg shadow-green-600/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-2">Need time off?</p>
                  <h4 className="text-lg font-poppins font-semibold mb-4">Apply for a New Leave</h4>
                  <button className="bg-white text-green-600 px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 hover:bg-green-50 transition-all">
                    <span>Create Request</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <Calendar className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const BalanceCard = ({ title, balance, color, icon }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-100 transition-all">
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-poppins font-semibold text-gray-900">{balance}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">Days</span>
      </div>
    </div>
    <div className={`p-3 rounded-lg transition-colors ${
      color === 'green' ? 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white' :
      color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
      'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
    }`}>
      {icon}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'approved': 'bg-green-50 text-green-700',
    'pending': 'bg-orange-50 text-orange-700',
    'declined': 'bg-red-50 text-red-700',
    'in-process': 'bg-blue-50 text-blue-700'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const ShieldIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

export default EmployeeDashboard;
