import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Waves, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState({ esp32_online: false, last_seen: null });
  const navigate = useNavigate();

  // Poll System Status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
         const data = await api.getSystemStatus();
         setStatus(data);
      } catch (e) {
          console.error("Layout Fetch Error", e);
      }
    };
    fetchStatus();
    
    // Refresh every 10s
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="border-b border-card-border bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div>
              <h2 className="text-slate-900 dark:text-white text-2xl font-light tracking-[0.25em] uppercase select-none">NERO</h2>
            </div>
            
            {/* Right Logic */}
            <div className="flex items-center gap-4">
              {/* Modern Status Badge */}
               <div className="hidden sm:flex items-center justify-center px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${user.role === 'admin' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-500'}`}></div>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-medium leading-none pt-[1px]">
                    {user.role === 'admin' ? 'Admin' : 'Guest'}
                  </span>
               </div>

              <div className="relative flex items-center">
                {user.role === 'viewer' && !user.id ? (
                    <button 
                      onClick={() => navigate('/login')}
                      className="bg-white text-black hover:bg-slate-200 active:scale-95 transition-all text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-full"
                    >
                      Sign In
                    </button>
                ) : (
                   <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="group flex items-center gap-2 outline-none"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 group-hover:border-slate-500 transition-colors flex items-center justify-center text-white font-medium text-xs shadow-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                    </button>
                )}

                {isDropdownOpen && (user.id) && (
                  <div className="absolute right-0 top-full mt-3 w-40 rounded-xl bg-[#0B1120] border border-white/10 shadow-2xl py-1 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <p className="text-xs text-white font-medium truncate">{user.name || 'User'}</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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
              <span className={`w-2 h-2 rounded-full ${status.esp32_online ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>ESP32: <span className="text-white">{status.esp32_online ? 'Connected' : 'Offline'}</span></span>
            </div>
            {/* 8051 Section Removed as requested */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Last Sync: <span className="text-white">{status.last_seen ? new Date(status.last_seen).toLocaleTimeString() : 'Never'}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>System Version: v2.5.0</span>
            <span>•</span>
            <span>Server Status: <span className="text-emerald-500">Healthy</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
