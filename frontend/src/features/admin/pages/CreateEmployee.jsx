import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, ArrowLeft, Save, User, Mail, 
  Briefcase, Shield, Smartphone, Calendar,
  Building2, Hash
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';

const CreateEmployee = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    corporate_id: '',
    department: 'Engineering',
    role: 'employee',
    position: '',
    phone: '',
    join_date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/admin/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        navigate('/admin/employees');
      } else {
        setError(result.message || 'Failed to create employee profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-montserrat text-gray-900">
      <Sidebar logout={logout} />

      <main className="flex-1 overflow-y-auto relative">
        <PageHeader 
          title="Add New Employee"
          subtitle="Manually register a new employee into the corporate directory."
          user={user}
        />

        <div className="p-8 max-w-4xl">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Directory
          </button>

          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus size={18} className="text-green-600" />
                Employee Information
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md flex items-center gap-3 text-red-600">
                  <span className="text-xs font-medium">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john.doe@vr.lms.com.ph"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Corporate ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Corporate ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input
                      required
                      type="text"
                      name="corporate_id"
                      value={formData.corporate_id}
                      onChange={handleChange}
                      placeholder="e.g. ep-2026-001-01"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer appearance-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="HR">HR</option>
                      <option value="Management Console">Management Console</option>
                    </select>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer appearance-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Position / Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g. Senior Backend Engineer"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +63 912 345 6789"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Join Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joining Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input
                      type="date"
                      name="join_date"
                      value={formData.join_date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4 border-t border-gray-50 pt-8">
                <button
                  type="button"
                  onClick={() => navigate('/admin/employees')}
                  className="px-6 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-8 py-2.5 rounded-md text-xs font-semibold shadow-sm flex items-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Employee</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEmployee;
