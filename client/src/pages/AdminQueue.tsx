import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminPostCard from '../components/AdminPostCard';

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

      const res = await axios.get('http://localhost:5050/api/admin/queue', {
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
          <h1 className="text-2xl font-semibold mb-2">Moderation Queue</h1>
          <p className="text-sm text-ts-text-muted">Review items flagged by AI processing.</p>
        </div>
      </header>

      {loading ? (
        <div className="text-ts-text-muted text-sm">Loading queue...</div>
      ) : error ? (
        <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="ts-card p-12 text-center border-dashed">
          <p className="text-ts-text-muted text-sm">No items in the queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-medium text-ts-text-muted uppercase tracking-wider mb-4">
            Showing {queue.length} items requiring review
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
