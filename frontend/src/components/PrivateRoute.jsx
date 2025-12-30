import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    // Simple loader while checking auth
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
