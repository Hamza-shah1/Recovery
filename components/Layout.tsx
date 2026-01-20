
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  role?: UserRole;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack, role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-[#f8fafc]">
      {/* Android System Style Header */}
      <header className="sticky top-0 z-[100] px-4 pt-12 pb-4 bg-[#f8fafc]/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-4">
            {showBack && (
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 flex items-center justify-center text-slate-900 active:bg-slate-200 rounded-full transition-colors"
              >
                <i className="fas fa-arrow-left text-lg"></i>
              </button>
            )}
            <h1 className="font-bold text-xl text-slate-900 tracking-tight">{title}</h1>
          </div>
          {onLogout && (
            <button 
              onClick={onLogout} 
              className="w-10 h-10 flex items-center justify-center text-slate-600 active:bg-slate-200 rounded-full transition-colors"
            >
              <i className="fas fa-ellipsis-vertical text-lg"></i>
            </button>
          )}
        </div>
      </header>

      {/* Main App Canvas */}
      <main className="flex-1 px-4 pb-32 overflow-y-auto">
        {children}
      </main>

      {/* Material 3 Navigation Bar (Android Standard) */}
      {role && (
        <nav className="fixed bottom-0 left-0 right-0 z-[200] max-w-md mx-auto bg-white border-t border-slate-100 flex justify-around items-center h-20 px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <M3NavItem 
            icon="fa-house" 
            label="Home"
            active={isActive('/dashboard')} 
            onClick={() => navigate('/dashboard')} 
          />
          <M3NavItem 
            icon="fa-address-book" 
            label="Clients"
            active={isActive('/clients')} 
            onClick={() => navigate('/clients')} 
          />
          
          {/* Central Android Action - Floating feel but docked */}
          {role === UserRole.SALESMAN && (
            <button 
              onClick={() => navigate('/add-payment')}
              className="w-14 h-14 -mt-8 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-xl ripple-effect active:scale-95 transition-all"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}

          <M3NavItem 
            icon="fa-brain" 
            label="Marshall"
            active={isActive('/ai-assistant')} 
            onClick={() => navigate('/ai-assistant')} 
          />
          <M3NavItem 
            icon="fa-chart-line" 
            label="Stats"
            active={isActive('/video-recap')} 
            onClick={() => navigate('/video-recap')} 
          />
        </nav>
      )}
    </div>
  );
};

const M3NavItem = ({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center flex-1 h-full space-y-1 group"
  >
    <div className={`px-5 py-1.5 rounded-full transition-all duration-200 ${active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 group-active:bg-slate-100'}`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <span className={`text-[10px] font-bold ${active ? 'text-indigo-700' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default Layout;
