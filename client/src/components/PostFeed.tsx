import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Clock, Inbox } from 'lucide-react';

interface Post {
  _id: string;
  text: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

interface PostFeedProps {
  refreshTrigger: number;
}

export default function PostFeed({ refreshTrigger }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 4000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/posts');
      setPosts(response.data.posts);
      setError('');
    } catch (err) {
      console.error(err);
      setError("Couldn't load posts — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let colorClass = '';
    let dotColor = '';
    let label = status ? status.replace('_', ' ') : 'pending';

    switch (status ? status.toLowerCase() : '') {
      case 'reviewed':
      case 'approved':
      case 'clean':
        colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        dotColor = 'bg-emerald-400';
        break;
      case 'removed':
        colorClass = 'bg-rose-500/15 text-rose-400 border-rose-500/35';
        dotColor = 'bg-rose-400';
        break;
      case 'flagged':
        colorClass = 'bg-red-500/10 text-red-400 border-red-500/30';
        dotColor = 'bg-red-400';
        break;
      case 'needs_review':
      case 'review':
        colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        dotColor = 'bg-amber-400';
        label = 'needs review';
        break;
      case 'processing':
        colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        dotColor = 'bg-cyan-400 animate-pulse';
        break;
      case 'pending':
      default:
        colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        dotColor = 'bg-slate-400';
        break;
    }

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colorClass} border`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></div>
        <span>{label}</span>
      </div>
    );
  };

  if (loading && posts.length === 0) return <p className="text-ts-textMuted text-sm">Loading posts...</p>;
  
  return (
    <div>
      <h2 className="text-lg font-semibold text-ts-textMain mb-4">Recent Submissions</h2>
      
      {error && (
        <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {posts.length === 0 && !error ? (
        <div className="ts-card p-12 text-center flex flex-col items-center justify-center border-dashed">
          <Inbox className="w-10 h-10 text-ts-textMuted/40 mb-3" />
          <p className="text-sm font-medium text-ts-textMain">Nothing submitted yet</p>
          <p className="text-xs text-ts-textMuted mt-1">Submitted content will appear here for review and status tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div 
              key={post._id} 
              className="ts-card p-5 animate-fade-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-ts-textMuted text-xs">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(post.createdAt).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </div>
                {getStatusBadge(post.status)}
              </div>
              <p className="text-sm text-ts-textMain whitespace-pre-wrap leading-relaxed">{post.text}</p>
              {post.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-ts-border bg-ts-bg">
                  <img 
                    src={post.imageUrl} 
                    alt="Attachment" 
                    className="w-full max-h-64 object-cover" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
