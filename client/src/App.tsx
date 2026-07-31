import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminQueue from './pages/AdminQueue';
import AdminAnalytics from './pages/AdminAnalytics';
import Header from './components/Header';
import { GridBackground } from './components/GridBackground';

// Simple PrivateRoute component
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

const AdminLayout = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen relative z-10 bg-ts-bg">
      <GridBackground />
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-slide-up">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-ts-bg text-ts-textMain">
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
