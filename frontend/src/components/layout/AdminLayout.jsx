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
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
              <div className="h-6 w-px bg-card-border mx-1"></div>
              
              <div className="relative">
                {user.role === 'viewer' && !user.id ? (
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium"
                    >
                      Sign In
                    </button>
                ) : (
                   <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-card-border transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <span className="text-sm font-medium text-white hidden sm:block group-hover:text-blue-200">{user.name || 'Admin'}</span>
                      <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {isDropdownOpen && (user.id) && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card-dark border border-card-border shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-card-border mb-1">
                      <p className="text-sm text-white font-medium">{user.name || 'User'}</p>
                      <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
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
