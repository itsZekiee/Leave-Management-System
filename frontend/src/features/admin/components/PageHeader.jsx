import React from 'react';
import { Bell } from 'lucide-react';

const PageHeader = ({ title, subtitle, user, data, notificationsOpen, setNotificationsOpen }) => {
  return (
    <header className="bg-white px-8 py-5 flex items-center justify-between sticky top-0 z-10 border-b border-gray-50">
      <div className="flex flex-col">
        <h1 className="text-xl font-poppins font-semibold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs font-medium text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="flex items-center space-x-5">
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 bg-gray-50 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all relative group"
          >
            {data?.notifications?.length > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20"></span>
            )}
            <Bell size={20} />
          </button>
          
          {/* Notification Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5 z-50">
              <div className="p-3.5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span className="font-semibold text-sm text-gray-900">Notifications</span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                  {data?.notifications?.length || 0} New
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {data?.notifications?.map(n => (
                  <div key={n.id} className="p-3.5 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors">
                    <p className="text-xs font-semibold text-gray-900">{n.user_name} requested {n.type}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{n.created_at}</p>
                  </div>
                ))}
                {(!data?.notifications || data.notifications.length === 0) && (
                  <div className="p-8 text-center text-gray-400 text-xs">No new requests</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pl-5 border-l border-gray-100">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-semibold text-gray-900">{user?.name || 'Admin'}</span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{user?.role || 'Administrator'}</span>
          </div>
          <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer hover:border-green-500 transition-colors">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="User Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
