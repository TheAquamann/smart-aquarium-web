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
        <div className="absolute inset-0 bg-zinc-950"></div>
        {/* Gradient Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/30 rounded-full blur-[120px]"></div>
        {/* Abstract Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBepkQ3JqYuHS15DEv-mv81ilp92hxvFIwzpAQHldVbjlJrxdPNgeuMFYWGhWlkuV7h3j5fMfzeWcQG_KcgHM-4cLfZAsLE1EyhFHTrSgxaLO2th8G-VyPZjhqn-tjfSN_QsQkLuptD9irSDaYcEIBtSw9F9L2OlS0_D8nRR5_2K-UsDtablNJpzglS7cG03AY3LC_nDX8ya0iYa1XLzPMoK1tCjCZQp1BDNLVEUMxcKbZd2S-XbqkEi2XwpyLWTSH4XXMRBhkpepI")' }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full max-w-[420px]">
        {/* Brand */}
        <div className="mb-10 text-center animate-float">
          <h2 className="text-4xl font-light tracking-[0.4em] text-white uppercase select-none">NERO</h2>
        </div>

        {/* Login Card */}
        <div className="glass-panel w-full rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-white tracking-tight text-xl font-medium mb-1">Welcome Back</h1>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider" htmlFor="email">Email</label>
              <div className="group flex w-full items-center rounded-lg border border-zinc-700 bg-zinc-900/50 focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-all duration-200">
                <input 
                  className="flex-1 w-full bg-transparent border-none text-white placeholder:text-zinc-600 focus:outline-none p-3 text-sm h-11" 
                  id="email" 
                  placeholder="name@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider" htmlFor="password">Password</label>
              </div>
              <div className="group flex w-full items-center rounded-lg border border-zinc-700 bg-zinc-900/50 focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-all duration-200">
                <input 
                  className="flex-1 w-full bg-transparent border-none text-white placeholder:text-zinc-600 focus:outline-none p-3 text-sm h-11" 
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
                  className="pr-3 flex items-center justify-center text-zinc-500 hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center rounded-full bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-widest h-11 transition-all duration-200 shadow-lg shadow-white/5 active:scale-[0.98]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

        </div>

        {/* Copyright */}
        <div className="mt-8 text-zinc-600 text-xs text-center z-10">
          © 2026 NERO Systems. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
