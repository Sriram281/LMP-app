import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Modules/Dashboard';
import CourseManagement from './components/Modules/CourseManagement';
import Experts from './components/Modules/Experts';
import Discussions from './components/Modules/Discussions';
import Reports from './components/Modules/Reports';
import Certificates from './components/Modules/Certificates';
import Settings from './components/Modules/Settings';
import AIChatbot from './components/AIChatbot';
import UserManagement from './components/Modules/UserManagement';

// Map URL paths to module identifiers
const pathToModuleMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/courses': 'courses',
  '/users': 'users',
  '/experts': 'experts',
  '/discussions': 'discussions',
  '/reports': 'reports',
  '/certificates': 'certificates',
  '/settings': 'settings',
};

// Map module identifiers to URL paths
const moduleToPathMap: Record<string, string> = {
  'dashboard': '/dashboard',
  'courses': '/courses',
  'users': '/users',
  'experts': '/experts',
  'discussions': '/discussions',
  'reports': '/reports',
  'certificates': '/certificates',
  'settings': '/settings',
};

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Determine active module based on current path
  const activeModule = pathToModuleMap[location.pathname] || 'dashboard';

  // Handle module change with navigation
  const handleModuleChange = (module: string) => {
    const path = moduleToPathMap[module] || '/dashboard';
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Protected layout for authenticated users
  const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        <AIChatbot />
      </div>
    );
  };

  // Public layout for authentication pages
  const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    // Allow access to reset password page even if user is authenticated
    // This is needed when users click the reset link from their email
    if (user && location.pathname !== '/reset-password') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <CourseManagement />;
      case 'users':
        return <UserManagement />;
      case 'experts':
        return <Experts />;
      case 'discussions':
        return <Discussions />;
      case 'reports':
        return <Reports />;
      case 'certificates':
        return <Certificates />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      } />
      <Route path="/forgot-password" element={
        <PublicLayout>
          <ForgotPassword onBackToLogin={() => window.location.href = '/login'} />
        </PublicLayout>
      } />
      <Route path="/reset-password" element={
        <PublicLayout>
          <ResetPassword onPasswordReset={() => window.location.href = '/login'} />
        </PublicLayout>
      } />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      } />
      <Route path="/courses" element={
        <ProtectedLayout>
          <CourseManagement />
        </ProtectedLayout>
      } />
      <Route path="/users" element={
        <ProtectedLayout>
          <UserManagement />
        </ProtectedLayout>
      } />
      <Route path="/experts" element={
        <ProtectedLayout>
          <Experts />
        </ProtectedLayout>
      } />
      <Route path="/discussions" element={
        <ProtectedLayout>
          <Discussions />
        </ProtectedLayout>
      } />
      <Route path="/reports" element={
        <ProtectedLayout>
          <Reports />
        </ProtectedLayout>
      } />
      <Route path="/certificates" element={
        <ProtectedLayout>
          <Certificates />
        </ProtectedLayout>
      } />
      <Route path="/settings" element={
        <ProtectedLayout>
          <Settings />
        </ProtectedLayout>
      } />
      
      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Catch all unmatched routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;