import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Plus, FileUp,
  ChevronLeft, ChevronRight, MoreHorizontal,
  Mail, Phone, Calendar as CalendarIcon, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import ImportSandbox from '../components/ImportSandbox';

const EmployeeDirectory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total_workforce: 0, punctuality_rate: 0, avg_leave_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: 'All Departments',
    role: 'All Roles',
    page: 1
  });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isImportOpen, setIsImportOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/employees?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
      });
      const result = await response.json();
      if (result.status === 'success') {
        setEmployees(result.data.employees.data);
        setPagination({
          current_page: result.data.employees.current_page,
          last_page: result.data.employees.last_page,
          total: result.data.employees.total
        });
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ search: '', department: 'All Departments', role: 'All Roles', page: 1 });
  };

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-montserrat text-gray-900">
      <Sidebar logout={logout} />

      <main className="flex-1 overflow-y-auto relative">
        <PageHeader
          title="Employee Directory"
          subtitle="Manage and monitor employee performance and records."
          user={user}
        />

        <div className="p-8 space-y-8">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer"
                >
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>HR</option>
                </select>
                <Filter className="absolute right-3 top-2.5 text-gray-400" size={14} />
              </div>

              <div className="relative">
                <select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer"
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Employee</option>
                  <option>Manager</option>
                </select>
                <Filter className="absolute right-3 top-2.5 text-gray-400" size={14} />
              </div>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all flex items-center space-x-2"
              >
                <span>Clear Filters</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name or email..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <button
                onClick={() => setIsImportOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-all"
                title="Import Excel"
              >
                <FileUp size={20} />
              </button>
              <button 
                onClick={() => navigate('/admin/employees/create')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
              >
                <Plus size={16} />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Tenure</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Attendance</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Leave Balance</th>
                    <th className="px-6 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          <span className="text-xs font-medium">Fetching directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-xs font-medium">
                        No employees found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`}
                              alt=""
                              className="w-10 h-10 rounded-full border border-gray-100"
                            />
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{emp.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{emp.position || 'Employee'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                              <Mail size={12} className="text-gray-300" />
                              <span>{emp.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                <Phone size={12} className="text-gray-300" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-gray-700">
                            {emp.join_date ? `${Math.floor((new Date() - new Date(emp.join_date)) / (1000 * 60 * 60 * 24 * 365.25 * 0.1)) / 10} Years` : 'New'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {emp.attendance_stats?.lates > 0 ? (
                              <span className="text-[10px] font-semibold text-red-600 flex items-center gap-1">
                                {emp.attendance_stats.lates} lates <span className="text-gray-400 font-normal">this month</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-green-600 flex items-center gap-1">
                                0 lates <span className="text-gray-400 font-normal underline decoration-green-200">perfect record</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold ${emp.leave_balance < 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {emp.leave_balance} days <span className="text-gray-400 font-medium tracking-tight">remaining</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            emp.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-300 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <p className="text-[10px] font-semibold text-gray-400">
                Showing <span className="text-gray-700">{employees.length}</span> of <span className="text-gray-700">{pagination.total}</span> entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({...filters, page: filters.page - 1})}
                  className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(pagination.last_page)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({...filters, page: i + 1})}
                    className={`w-8 h-8 text-[10px] font-bold rounded border transition-all ${
                      filters.page === i + 1
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={filters.page === pagination.last_page}
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBlock
              title="TOTAL WORKFORCE"
              value={stats.total_workforce}
              subValue="+12%"
              subLabel="Employees"
              color="green"
              icon={<Users size={20} />}
            />
            <StatBlock
              title="PUNCTUALITY RATE"
              value={`${stats.punctuality_rate}%`}
              subValue="Target: 95%"
              color="blue"
              icon={<CheckCircle2 size={20} />}
            />
            <StatBlock
              title="AVG. LEAVE BALANCE"
              value={`${stats.avg_leave_balance} Days`}
              subValue="Low Balance"
              color="orange"
              icon={<AlertCircle size={20} />}
            />
          </div>
        </div>
      </main>

      {isImportOpen && (
        <ImportSandbox
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => {
            setIsImportOpen(false);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
};

const StatBlock = ({ title, value, subValue, subLabel, color, icon }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-poppins font-semibold text-gray-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${
        color === 'green' ? 'bg-green-50 text-green-600' :
        color === 'blue' ? 'bg-blue-50 text-blue-600' :
        'bg-orange-50 text-orange-600'
      }`}>
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        color === 'green' ? 'bg-green-50 text-green-600' :
        color === 'blue' ? 'bg-gray-50 text-gray-500' :
        'bg-red-50 text-red-600'
      }`}>
        {subValue}
      </span>
      {subLabel && <span className="text-[10px] font-medium text-gray-400">{subLabel}</span>}
    </div>
    <div className={`absolute bottom-0 left-0 h-1 transition-all group-hover:w-full w-1/4 ${
      color === 'green' ? 'bg-green-500' :
      color === 'blue' ? 'bg-blue-500' :
      'bg-orange-500'
    }`} />
  </div>
);

export default EmployeeDirectory;
