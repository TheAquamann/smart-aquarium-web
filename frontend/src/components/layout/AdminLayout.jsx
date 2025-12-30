import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Waves, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { user, toggleRole, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
                   <button onClick={toggleRole} className="text-[10px] underline text-slate-500 hover:text-white cursor-pointer">
                      Switch Role
                   </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
              <div className="h-6 w-px bg-card-border mx-1"></div>
              
              <div className="relative">
                {user.role === 'viewer' && !user.id ? (
                    // 1. Guest View: Show Sign In Button
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all text-sm font-medium"
                    >
                      Sign In
                    </button>
                ) : (
                    // 2. Logged In View (Admin or Authenticated Viewer) can verify via user.id check or session check
                    // We rely on user.id or session from context usually, but here checking user.id is safe enough if auth flow sets it
                    // Actually checking 'session' from useAuth is better if we exposed it. 
                    // Let's use the toggle logic: if we are in 'viewer' mode but logged in, we still show profile.
                    // The best check is: do we have a session?
                   
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

                {/* Dropdown Menu - Only render if logged in */}
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
