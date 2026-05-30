import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Search, Calendar, Download, CheckCircle, 
  Clock, Check, X, ChevronLeft, ChevronRight, MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';

/**
 * LeaveRequests - Advanced Management Module
 */
const LeaveRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ urgent_count: 0, departmental_trends: [] });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  
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

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
      });
      const result = await response.json();
      if (result.status === 'success') {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchDashboardData();
  }, [fetchData, fetchDashboardData]);

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
      <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border uppercase tracking-wider ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading && requests.length === 0) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading leave applications...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-montserrat text-gray-900">
      <Sidebar logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <PageHeader 
          title="Leave Requests"
          subtitle="Manage and process employee leave applications efficiently."
          user={user}
          data={dashboardData}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
        />

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-100 rounded-lg font-semibold text-xs text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => setBulkMode(!bulkMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-sm ${bulkMode ? 'bg-gray-900 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                <CheckCircle size={16} />
                <span>{bulkMode ? 'Cancel Bulk' : 'Bulk Actions'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Overlay */}
          {bulkMode && selectedIds.length > 0 && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 lg:left-[calc(50%+128px)] bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center space-x-6 animate-in slide-in-from-bottom-8">
              <span className="font-semibold text-xs uppercase tracking-widest text-slate-400">{selectedIds.length} Selected</span>
              <div className="h-6 w-px bg-slate-700"></div>
              <div className="flex items-center space-x-3">
                <button onClick={() => handleBulkUpdate('approved')} className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-md text-xs font-semibold transition-colors">
                  <Check size={14} /> <span>Approve All</span>
                </button>
                <button onClick={() => handleBulkUpdate('in-process')} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-semibold transition-colors">
                  <Clock size={14} /> <span>In-Process</span>
                </button>
                <button onClick={() => handleBulkUpdate('declined')} className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-md text-xs font-semibold transition-colors">
                  <X size={14} /> <span>Reject All</span>
                </button>
              </div>
            </div>
          )}

          {/* Filters & Tabs */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center border-b border-gray-100 bg-white">
              <div className="flex p-1.5 bg-gray-50 m-4 rounded-lg">
                {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilters({...filters, status: tab, page: 1})}
                    className={`px-5 py-1.5 rounded-md text-xs font-semibold transition-all ${filters.status === tab ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 flex flex-wrap items-center px-4 pb-4 lg:pb-0 gap-4 lg:justify-end">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search name or ID..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs font-medium focus:ring-1 focus:ring-green-500 transition-all"
                  />
                </div>
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2 border border-transparent">
                  <Calendar size={16} className="text-gray-400" />
                  <input 
                    type="date" 
                    value={filters.start_date}
                    onChange={(e) => setFilters({...filters, start_date: e.target.value, page: 1})}
                    className="bg-transparent border-none text-[11px] font-semibold p-0 focus:ring-0 w-28" 
                  />
                  <span className="text-gray-300">-</span>
                  <input 
                    type="date" 
                    value={filters.end_date}
                    onChange={(e) => setFilters({...filters, end_date: e.target.value, page: 1})}
                    className="bg-transparent border-none text-[11px] font-semibold p-0 focus:ring-0 w-28" 
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-semibold tracking-widest border-b border-gray-100">
                    {bulkMode && <th className="px-6 py-4 w-10"></th>}
                    <th className="px-8 py-4">Employee</th>
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    {!bulkMode && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></div>
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-400 text-xs">No leave requests found.</td>
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
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500/20"
                            />
                          </td>
                        )}
                        <td className="px-8 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center font-semibold text-xs text-gray-500 overflow-hidden border border-gray-200">
                              <img src={`https://ui-avatars.com/api/?name=${req.user.name}&background=random`} alt="" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm leading-tight">{req.user.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{req.user.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-xs text-gray-600">{req.type}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-gray-900">{new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase mt-0.5 tracking-wider">
                            {Math.ceil((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24)) + 1} Days
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-medium text-gray-500">
                          {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(req.status)}
                        </td>
                        {!bulkMode && (
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all">
                              <MoreHorizontal size={18} />
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
              <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-50">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Showing {meta.from} to {meta.to} of {meta.total} requests
                </span>
                <div className="flex space-x-1.5">
                  <button 
                    disabled={filters.page === 1}
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                    className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[...Array(meta.last_page)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters({...filters, page: i + 1})}
                      className={`h-8 w-8 rounded-md font-semibold text-xs transition-all ${filters.page === i + 1 ? 'bg-green-600 text-white shadow-md shadow-green-600/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={filters.page === meta.last_page}
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                    className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-green-50 rounded-lg p-8 border border-green-100 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-600/10 p-2 rounded-lg"><AlertCircle className="text-green-600" size={20} /></div>
                  <h3 className="text-lg font-poppins font-semibold text-gray-900">Need urgent review</h3>
                </div>
                <p className="text-sm text-gray-600 max-w-md font-medium">
                  There are <span className="text-green-600 font-semibold">{stats.urgent_count} leave requests</span> scheduled to start within the next 48 hours that require your immediate attention.
                </p>
                <button 
                  onClick={() => setFilters({...filters, status: 'Pending'})}
                  className="mt-6 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-xs transition-all shadow-md shadow-green-600/10"
                >
                  <span>Process Now</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              <AlertCircle className="absolute -right-8 -bottom-8 h-48 w-48 text-green-600 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6">Departmental Trend</h3>
              <div className="space-y-5">
                {stats.departmental_trends.map(trend => (
                  <div key={trend.department}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-semibold text-xs text-gray-900">{trend.department}</span>
                      <span className="text-green-600 font-semibold text-[10px]">{trend.count} Requests</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${Math.min(100, (trend.count / meta.total) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {stats.departmental_trends.length === 0 && <p className="text-gray-400 text-[10px]">No data available.</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---


export default LeaveRequests;
