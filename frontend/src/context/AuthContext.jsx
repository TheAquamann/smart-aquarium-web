import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState({ role: 'viewer' }); // Default role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Failsafe: Turn off loading after 1 second if Supabase hangs
    // This prevents the "Blank Screen" experience
    const timer = setTimeout(() => {
        if (mounted && loading) {
            console.warn("Auth check timed out, forcing load.");
            setLoading(false);
        }
    }, 1200);

    const initAuth = async () => {
        try {
            // Quick check for session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (mounted) {
                setSession(session);
                // Don't await role check to unblock UI
                if (session) {
                    fetchRole(session.user.id).finally(() => {
                        if (mounted) setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error("Auth init error:", error);
            if (mounted) setLoading(false);
        }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      
      if (session) {
        // Optimistic load - unblock immediately, role will update in background
        // But for "Protected" routes we might want to wait? 
        // Let's settle for: Show dashboard (as viewer), then upgrade to Admin if role loads
        setLoading(false); 
        await fetchRole(session.user.id);
      } else {
        setUser({ role: 'viewer' });
        setLoading(false);
      }
    });

    return () => {
        mounted = false;
        clearTimeout(timer);
        subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (userId) => {
    try {
      console.log("Fetching role via Backend API for:", userId);
      
      // 1. Call Backend API (Proxies to Supabase Service Role)
      const data = await api.getUserRole(userId);
      const { role } = data;
      console.log("Backend determined role:", role);
      
      setUser({ id: userId, role });

    } catch (error) {
      console.error('Role check failed:', error);
      // Fail safe -> viewer
      setUser({ id: userId, role: 'viewer' });
    }
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    // 1. Optimistic Context Clear
    setSession(null);
    setUser({ role: 'viewer' });

    // 2. Force Clear LocalStorage (Brute Force)
    // Project ID usually in URL: nrsfwuwgpqllyjldwpjz
    try {
        localStorage.removeItem('sb-nrsfwuwgpqllyjldwpjz-auth-token');
    } catch (e) {
        console.warn("Manual LS clear failed", e);
    }

    // 3. Official Supabase SignOut (Local Scope ensuring no network block)
    try {
        await supabase.auth.signOut({ scope: 'local' }); 
        // We use 'local' so it doesn't wait for the server if network is flaky
    } catch (error) {
        console.error("Supabase signOut error:", error);
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
