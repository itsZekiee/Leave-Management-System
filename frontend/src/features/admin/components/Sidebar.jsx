import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Calendar, Users, Settings, 
  HelpCircle, ShieldCheck, LogOut 
} from 'lucide-react';

const Sidebar = ({ logout }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex flex-col space-y-1">
          <h2 className="text-lg font-poppins font-semibold text-gray-900 tracking-tight">VR-LMS Admin</h2>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Management Console</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <SidebarLink 
          to="/admin/dashboard" 
          icon={<LayoutDashboard size={18}/>} 
          label="Dashboard" 
          active={location.pathname === '/admin/dashboard'} 
        />
        <SidebarLink 
          to="/admin/leave-requests" 
          icon={<FileText size={18} />} 
          label="Leave Requests" 
          active={location.pathname === '/admin/leave-requests'} 
        />
        <SidebarLink icon={<Calendar size={18} />} label="Team Calendar" />
        <SidebarLink 
          to="/admin/employees" 
          icon={<Users size={18} />} 
          label="Employee Directory" 
          active={location.pathname === '/admin/employees'}
        />
        <SidebarLink icon={<Settings size={18} />} label="Admin Settings" />
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 space-y-4">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow-md shadow-green-600/10 transition-all flex items-center justify-center space-x-2 text-sm">
            <span className="text-lg">+</span>
            <span>New Request</span>
          </button>

          <div className="space-y-1 pt-4 border-t border-gray-50">
            <SecondaryNavLink icon={<HelpCircle size={16} />} label="Help Center" />
            <SecondaryNavLink icon={<ShieldCheck size={16} />} label="Privacy Policy" />
            <button 
              onClick={logout} 
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-500 hover:text-red-600 transition-colors group"
            >
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-medium text-xs">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon, label, to = "#", active = false }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
      active 
        ? 'bg-green-50 text-green-700' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <span className={`${active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}>
      {icon}
    </span>
    <span className="text-xs font-semibold tracking-wide">{label}</span>
  </Link>
);

const SecondaryNavLink = ({ icon, label }) => (
  <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-gray-700 transition-colors group text-left">
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-medium text-[11px] tracking-wide">{label}</span>
  </button>
);

export default Sidebar;
