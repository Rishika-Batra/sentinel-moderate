import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import AdminPostCard from '../components/AdminPostCard';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

const AdminQueue = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/admin/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueue(res.data.queue);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
      setError("Couldn't load posts — check your connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="w-full">
      <header className="mb-8 border-b border-ts-border pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ts-textMain mb-1">Moderation Queue</h1>
          <p className="text-sm text-ts-textMuted">Review items flagged for manual moderation and decision making.</p>
        </div>
      </header>

      {loading ? (
        <div className="text-ts-textMuted text-sm py-8">Loading queue...</div>
      ) : error ? (
        <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="ts-card p-12 text-center flex flex-col items-center justify-center border-dashed">
          <CheckCircle2 className="w-10 h-10 text-status-clean/60 mb-3" />
          <p className="text-sm font-medium text-ts-textMain">Queue is clear</p>
          <p className="text-xs text-ts-textMuted mt-1">Nothing submitted yet — flagged content will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center text-xs font-semibold text-ts-textMuted uppercase tracking-wider mb-4">
            <ShieldAlert className="w-4 h-4 text-ts-accent mr-2" />
            Showing {queue.length} {queue.length === 1 ? 'item' : 'items'} requiring review
          </div>
          {queue.map((post, index) => (
            <AdminPostCard 
              key={post._id} 
              post={post} 
              onReview={fetchQueue}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQueue;
