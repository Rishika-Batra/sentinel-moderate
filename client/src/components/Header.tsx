import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ListTodo, LayoutDashboard, LogOut, Lock, Send } from 'lucide-react';

interface HeaderProps {
  user?: { name: string; email: string; picture?: string } | null;
  onUserLogout?: () => void;
}

export default function Header({ user, onUserLogout }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLoginPage = location.pathname === '/admin/login';
  const hasAdminToken = Boolean(localStorage.getItem('adminToken'));

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/queue', label: 'Review Queue', icon: ListTodo },
    { path: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-ts-border bg-ts-bg/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-ts-accent/10 p-2 rounded-lg border border-ts-accent/20 group-hover:border-ts-accent/40 transition-colors">
              <Shield className="w-5 h-5 text-ts-accent" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-heading font-bold text-lg tracking-tight text-ts-textMain">
                Sentinel
              </span>
              <span className="text-xs font-medium text-ts-textMuted uppercase tracking-wider hidden sm:inline-block">
                {isAdminRoute ? 'Admin' : 'Moderation Platform'}
              </span>
            </div>
          </Link>

          {/* Navigation Items (Admin Tabs) */}
          {isAdminRoute && hasAdminToken && !isAdminLoginPage && (
            <nav className="flex space-x-1 sm:space-x-4 h-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 border-b-2 text-sm font-medium transition-colors h-16 ${
                      isActive
                        ? 'border-ts-accent text-ts-textMain'
                        : 'border-transparent text-ts-textMuted hover:text-ts-textMain hover:border-ts-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Public Nav Tab (when on home page) */}
          {!isAdminRoute && (
            <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-ts-textMuted px-3 py-1.5 rounded-full bg-ts-surface border border-ts-border">
              <Send className="w-3.5 h-3.5 text-ts-accent" />
              <span>Public Submission Portal</span>
            </div>
          )}

          {/* Right Action Section */}
          <div className="flex items-center space-x-3">
            {isAdminRoute && hasAdminToken && !isAdminLoginPage ? (
              <button
                onClick={handleAdminLogout}
                className="flex items-center space-x-2 text-sm font-medium text-ts-textMuted hover:text-ts-textMain border border-ts-border bg-ts-surface px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            ) : !isAdminRoute ? (
              user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-ts-textMuted hidden sm:inline">{user.name}</span>
                  <button
                    onClick={onUserLogout}
                    className="flex items-center space-x-1.5 text-xs font-medium text-ts-textMuted hover:text-ts-textMain border border-ts-border bg-ts-surface px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/queue"
                  className="flex items-center space-x-2 text-xs font-medium text-ts-textMuted hover:text-ts-textMain border border-ts-border bg-ts-surface px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-ts-accent" />
                  <span>Admin Portal</span>
                </Link>
              )
            ) : isAdminLoginPage ? (
              <Link
                to="/"
                className="flex items-center space-x-2 text-xs font-medium text-ts-textMuted hover:text-ts-textMain border border-ts-border bg-ts-surface px-3 py-1.5 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-ts-accent" />
                <span>Public Portal</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
