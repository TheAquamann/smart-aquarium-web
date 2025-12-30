import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Droplets, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Redirect if already logged in
  React.useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden relative min-h-screen flex flex-col items-center justify-center">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Blue Base */}
        <div className="absolute inset-0 bg-[#0f172a] dark:bg-[#050b14]"></div>
        {/* Gradient Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/30 rounded-full blur-[120px]"></div>
        {/* Abstract Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBepkQ3JqYuHS15DEv-mv81ilp92hxvFIwzpAQHldVbjlJrxdPNgeuMFYWGhWlkuV7h3j5fMfzeWcQG_KcgHM-4cLfZAsLE1EyhFHTrSgxaLO2th8G-VyPZjhqn-tjfSN_QsQkLuptD9irSDaYcEIBtSw9F9L2OlS0_D8nRR5_2K-UsDtablNJpzglS7cG03AY3LC_nDX8ya0iYa1XLzPMoK1tCjCZQp1BDNLVEUMxcKbZd2S-XbqkEi2XwpyLWTSH4XXMRBhkpepI")' }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full max-w-[480px]">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3 animate-float">
          <div className="flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-primary to-cyan-600 shadow-lg shadow-primary/30 text-white">
            <Droplets className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">AquaMonitor</h2>
        </div>

        {/* Login Card */}
        <div className="glass-panel w-full rounded-xl shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-white tracking-tight text-2xl font-bold leading-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-normal leading-relaxed">Sign in to monitor your smart aquarium ecosystem.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-300 text-sm font-medium leading-normal" htmlFor="email">Email Address</label>
              <div className="group flex w-full items-center rounded-lg border border-slate-700 bg-slate-900/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                <input 
                  className="flex-1 w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:outline-none p-3.5 text-sm h-12" 
                  id="email" 
                  placeholder="user@aquarium.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <div className="pr-3.5 flex items-center justify-center text-slate-500 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 text-sm font-medium leading-normal" htmlFor="password">Password</label>
              </div>
              <div className="group flex w-full items-center rounded-lg border border-slate-700 bg-slate-900/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                <input 
                  className="flex-1 w-full bg-transparent border-none text-white placeholder:text-slate-500 focus:outline-none p-3.5 text-sm h-12" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3.5 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <a className="text-xs font-medium text-primary hover:text-blue-400 transition-colors" href="#">Forgot password?</a>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center rounded-lg bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm h-12 transition-all duration-200 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/60"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 text-xs text-slate-500 uppercase tracking-wider bg-[#101622]/80 backdrop-blur-sm rounded">System Access</span>
            </div>
          </div>

           {/* Footer */}
           <div className="text-center">
            <p className="text-slate-400 text-sm">
                Don't have an account? 
                <a className="font-medium text-primary hover:text-blue-400 transition-colors ml-1" href="#">Contact Admin</a>
            </p>
            {/* Role Hint */}
            <div className="mt-6 flex justify-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>System Operational</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure Connection</span>
                </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-slate-500 text-xs text-center z-10">
          © 2024 AquaMonitor Systems. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
