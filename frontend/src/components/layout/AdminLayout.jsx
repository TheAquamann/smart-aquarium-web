import { useAuth } from '../../context/AuthContext';
import { Waves, Bell, Settings, ChevronDown } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, toggleRole } = useAuth();
  
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b border-card-border bg-card-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Waves className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white text-lg font-bold leading-tight tracking-tight">AquaMonitor Pro</h2>
                <div className="flex items-center gap-2">
                   <span className={`text-[10px] uppercase font-bold tracking-wider w-fit px-1.5 rounded text-center ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-700/50 text-slate-400'}`}>
                      {user.role === 'admin' ? 'Admin Access' : 'Viewer Access'}
                   </span>
                   <button onClick={toggleRole} className="text-[10px] underline text-slate-500 hover:text-white cursor-pointer">
                      Switch Role
                   </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-card-border transition-colors text-text-secondary hover:text-white">
                <Bell className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-card-border mx-1"></div>
              <button className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-card-border transition-colors group">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                  JD
                </div>
                <span className="text-sm font-medium text-white hidden sm:block group-hover:text-blue-200">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </button>
              <button className="flex items-center justify-center h-10 w-10 rounded-lg bg-card-border text-white hover:bg-card-border/80 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto w-full flex flex-col gap-6">
        {children}
      </main>

       {/* Footer */}
       <footer className="mt-auto border-t border-card-border bg-card-dark py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Wi-Fi: <span className="text-white">Connected (5GHz)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Last Sync: <span className="text-white">Just now</span></span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>System Version: v2.4.1</span>
            <span>•</span>
            <span>Server Status: <span className="text-emerald-500">Healthy</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
