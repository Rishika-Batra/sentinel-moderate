import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { Shield } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] w-full relative z-10 animate-fade-slide-up">
      <div className="ts-card max-w-[400px] w-full p-8 mx-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-ts-accent/10 p-2 rounded-lg border border-ts-accent/20">
            <Shield className="w-6 h-6 text-ts-accent" />
          </div>
          <h2 className="text-2xl font-semibold">Sentinel</h2>
        </div>
        
        {error && (
          <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6 w-full">
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
            className="ts-button-primary w-full mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
