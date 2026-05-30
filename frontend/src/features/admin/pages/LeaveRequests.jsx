import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Search, Filter, Calendar, Download, CheckCircle, XCircle, 
  Clock, Check, X, ChevronLeft, ChevronRight, MoreHorizontal,
  AlertCircle, Users, LayoutDashboard, FileText, Settings, LogOut, Menu
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const LeaveRequests = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ urgent_count: 0, departmental_trends: [] });
  
  const [filters, setFilters] = useState({
    status: 'All',
    search: '',
    start_date: '',
    end_date: '',
    page: 1
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/leave-requests?${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
      });
      const result = await response.json();
      if (result.status === 'success') {
        setRequests(result.data.requests.data);
        setMeta(result.data.requests);
        setStats({
          urgent_count: result.data.urgent_count,
          departmental_trends: result.data.departmental_trends
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBulkUpdate = async (targetStatus) => {
    if (selectedIds.length === 0) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/leave-requests/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ids: selectedIds, target_status: targetStatus }),
      });
      
      if (response.ok) {
        setSelectedIds([]);
        setBulkMode(false);
        fetchData();
      }
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      const query = new URLSearchParams({
        start_date: filters.start_date,
        end_date: filters.end_date
      }).toString();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/leave-requests/export?${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_requests_${filters.start_date || 'all'}_to_${filters.end_date || 'all'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-orange-50 text-orange-600 border-orange-100",
      approved: "bg-green-50 text-green-600 border-green-100",
      declined: "bg-red-50 text-red-600 border-red-100",
      'in-process': "bg-blue-50 text-blue-600 border-blue-100"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-white font-montserrat">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex fixed h-full">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">V</div>
            <h2 className="text-xl font-poppins font-bold tracking-tight">VR LMS</h2>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <Link to="/admin/dashboard" className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === '/admin/dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/leave-requests" className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === '/admin/leave-requests' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <FileText size={20} />
            <span>Leave Requests</span>
          </Link>
          <NavItem icon={<Users size={20} />} label="Employee Directory" />
          <NavItem icon={<Settings size={20} />} label="Admin Settings" />
        </nav>
        <div className="p-6 mt-auto border-t border-slate-800">
          <button onClick={logout} className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-3">
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-500 mt-1">Manage and process employee leave applications efficiently.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => setBulkMode(!bulkMode)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${bulkMode ? 'bg-gray-900 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}
            >
              <CheckCircle size={18} />
              <span>{bulkMode ? 'Cancel Bulk' : 'Bulk Actions'}</span>
            </button>
          </div>
        </header>

        {/* Bulk Action Overlay */}
        {bulkMode && selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 lg:left-[calc(50%+128px)] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center space-x-6 animate-in slide-in-from-bottom-8">
            <span className="font-bold text-sm uppercase tracking-widest text-slate-400">{selectedIds.length} Selected</span>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex items-center space-x-3">
              <button onClick={() => handleBulkUpdate('approved')} className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors">
                <Check size={16} /> <span>Approve All</span>
              </button>
              <button onClick={() => handleBulkUpdate('in-process')} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors">
                <Clock size={16} /> <span>Mark In-Process</span>
              </button>
              <button onClick={() => handleBulkUpdate('declined')} className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold transition-colors">
                <X size={16} /> <span>Reject All</span>
              </button>
            </div>
          </div>
        )}

        {/* Filters & Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center border-b border-gray-100">
            <div className="flex p-2 bg-gray-50/50 m-4 rounded-xl">
              {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilters({...filters, status: tab, page: 1})}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filters.status === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 flex flex-wrap items-center p-4 gap-4 lg:justify-end">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name or corporate ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 gap-3 border border-transparent focus-within:border-gray-200">
                <Calendar size={18} className="text-gray-400" />
                <input 
                  type="date" 
                  value={filters.start_date}
                  onChange={(e) => setFilters({...filters, start_date: e.target.value, page: 1})}
                  className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0 w-32" 
                />
                <span className="text-gray-300">-</span>
                <input 
                  type="date" 
                  value={filters.end_date}
                  onChange={(e) => setFilters({...filters, end_date: e.target.value, page: 1})}
                  className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0 w-32" 
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                  {bulkMode && <th className="px-6 py-4 w-10"></th>}
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                  {!bulkMode && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400">No leave requests found.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                      {bulkMode && (
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(req.id)}
                            onChange={() => toggleSelect(req.id)}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                          />
                        </td>
                      )}
                      <td className="px-8 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border-2 border-white shadow-sm">
                            {req.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{req.user.name}</p>
                            <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">{req.user.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">{req.type}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5 tracking-wider">
                          {Math.ceil((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      {!bulkMode && (
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {meta.from} to {meta.to} of {meta.total} requests
              </span>
              <div className="flex space-x-2">
                <button 
                  disabled={filters.page === 1}
                  onClick={() => setFilters({...filters, page: filters.page - 1})}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>
                {[...Array(meta.last_page)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({...filters, page: i + 1})}
                    className={`h-9 w-9 rounded-lg font-bold text-sm transition-all ${filters.page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={filters.page === meta.last_page}
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-green-50 rounded-3xl p-8 border border-green-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-lg"><AlertCircle className="text-primary" /></div>
                <h3 className="text-xl font-poppins font-bold text-gray-900">Need urgent review</h3>
              </div>
              <p className="text-gray-600 max-w-md font-medium">
                There are <span className="text-primary font-bold">{stats.urgent_count} leave requests</span> scheduled to start within the next 48 hours that require your immediate attention.
              </p>
              <button 
                onClick={() => setFilters({...filters, status: 'Pending'})}
                className="mt-6 flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                <span>Process Now</span>
                <ChevronRight size={18} />
              </button>
            </div>
            <AlertCircle className="absolute -right-12 -bottom-12 h-64 w-64 text-primary opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Departmental Trend</h3>
            <div className="space-y-6">
              {stats.departmental_trends.map(trend => (
                <div key={trend.department}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">{trend.department}</span>
                    <span className="text-primary font-black">{trend.count} Requests</span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min(100, (trend.count / meta.total) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {stats.departmental_trends.length === 0 && <p className="text-gray-400 text-sm">No data available.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-semibold transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default LeaveRequests;
