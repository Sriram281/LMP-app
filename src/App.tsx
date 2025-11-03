import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Modules/Dashboard';
import CourseManagement from './components/Modules/CourseManagement';
import UserManagement from './components/Modules/UserManagement';
import Experts from './components/Modules/Experts';
import Discussions from './components/Modules/Discussions';
import Reports from './components/Modules/Reports';
import Certificates from './components/Modules/Certificates';
import Settings from './components/Modules/Settings';
import AIChatbot from './components/AIChatbot';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderModule()}
          </div>
        </main>
      </div>

      <AIChatbot />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;