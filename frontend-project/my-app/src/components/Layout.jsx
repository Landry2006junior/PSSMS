import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, User, Bell } from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rubavu District Parking</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{user?.role || 'System Manager'}</p>
              </div>
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {(user?.name || 'A').charAt(0)}
              </div>
            </div>
          </div>
        </header>


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
