import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/layout/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ui/Toast';

import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Public Dashboard Route (Viewer Mode by default) */}
            <Route path="/" element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
            } />
            
            {/* Legacy redirect just in case */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
