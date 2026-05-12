import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Car, 
  LayoutDashboard, 
  SquareParking, 
  ClipboardList, 
  CreditCard, 
  BarChart3, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cars', path: '/cars', icon: Car },
    { name: 'Parking Slots', path: '/slots', icon: SquareParking },
    { name: 'Parking Records', path: '/records', icon: ClipboardList },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-full
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3 text-white">
              <SquareParking size={24} className="text-indigo-400" />
              <h1 className="text-xl font-bold">SmartPark</h1>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-indigo-600 text-white font-semibold' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

    
