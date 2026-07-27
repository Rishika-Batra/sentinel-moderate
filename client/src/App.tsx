import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminQueue from './pages/AdminQueue';
import AdminAnalytics from './pages/AdminAnalytics';
import { Shield, LogOut, LayoutDashboard, ListTodo } from 'lucide-react';
import { GridBackground } from './components/GridBackground';

// Simple PrivateRoute component
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

const AdminLayout = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/queue', label: 'Review Queue', icon: ListTodo },
    { path: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  ];

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ts-border bg-ts-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-ts-accent" />
              <span className="font-heading font-semibold text-lg tracking-tight">
                Sentinel Admin
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8 h-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-1 border-b-2 text-sm font-medium transition-colors h-16 ${
                      isActive
                        ? 'border-ts-accent text-ts-text-main'
                        : 'border-transparent text-ts-text-muted hover:text-ts-text-main hover:border-ts-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm font-medium text-ts-text-muted hover:text-ts-text-main border border-transparent hover:border-ts-border px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-slide-up">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <GridBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route 
          path="/admin/queue" 
          element={
            <PrivateRoute>
              <AdminLayout>
                <AdminQueue />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <PrivateRoute>
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
