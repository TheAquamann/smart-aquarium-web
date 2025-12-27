import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    role: 'admin', // 'admin' or 'viewer'
  });

  const toggleRole = () => {
    setUser(prev => ({
      ...prev,
      role: prev.role === 'admin' ? 'viewer' : 'admin'
    }));
  };

  return (
    <AuthContext.Provider value={{ user, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
