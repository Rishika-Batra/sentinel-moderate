import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { Shield } from 'lucide-react';
import LuminousRibbonBackground from '../components/LuminousRibbonBackground';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/queue');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-black overflow-hidden p-4 animate-fade-slide-up">
      <LuminousRibbonBackground />
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: isHovered
            ? '0 0 70px 15px rgba(45, 212, 191, 0.85), 0 0 30px 5px rgba(45, 212, 191, 0.95)'
            : '0 10px 40px -10px rgba(0, 0, 0, 0.8)',
          borderColor: isHovered ? '#2DD4BF' : '#232B42',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="ts-card max-w-[400px] w-full p-8 flex flex-col bg-ts-surface/95 backdrop-blur-md rounded-2xl border relative z-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div 
            style={{
              borderColor: isHovered ? '#2DD4BF' : 'rgba(45, 212, 191, 0.2)',
              backgroundColor: isHovered ? 'rgba(45, 212, 191, 0.25)' : 'rgba(45, 212, 191, 0.1)',
              transition: 'all 0.4s ease',
            }}
            className="p-2.5 rounded-xl border"
          >
            <Shield className="w-6 h-6 text-ts-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ts-textMain">Sentinel</h2>
            <p className="text-xs text-ts-textMuted uppercase tracking-wider font-medium">Moderation Platform</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5 w-full">
          <div>
            <label className="ts-label">Username</label>
            <input
              type="text"
              required
              className="ts-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="ts-label">Password</label>
            <input
              type="password"
              required
              className="ts-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ts-button-primary w-full mt-2 py-3 text-sm font-semibold"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
