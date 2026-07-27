import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';

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
      const response = await axios.get('http://localhost:5050/api/posts');
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
    
    switch (status.toLowerCase()) {
      case 'clean':
        colorClass = 'bg-status-clean/10 text-status-clean';
        dotColor = 'bg-status-clean';
        break;
      case 'needs_review':
        colorClass = 'bg-status-review/10 text-status-review';
        dotColor = 'bg-status-review';
        break;
      case 'flagged':
        colorClass = 'bg-status-flagged/10 text-status-flagged';
        dotColor = 'bg-status-flagged';
        break;
      case 'pending':
      default:
        colorClass = 'bg-status-pending/10 text-status-pending';
        dotColor = 'bg-status-pending';
        break;
    }
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full ${colorClass} border border-transparent`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></div>
        <span className="text-[10px] font-semibold uppercase tracking-wider">{status.replace('_', ' ')}</span>
      </div>
    );
  };

  if (loading && posts.length === 0) return <p className="text-ts-text-muted text-sm">Loading posts...</p>;
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
      
      {error && (
        <div className="bg-red-900/20 py-3 px-4 rounded-lg border border-red-500/30 w-full mb-6">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {posts.length === 0 && !error ? (
        <div className="ts-card p-12 text-center border-dashed">
          <p className="text-ts-text-muted">No items in the queue.</p>
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
                <div className="flex items-center text-ts-text-muted text-xs">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {new Date(post.createdAt).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </div>
                {getStatusBadge(post.status)}
              </div>
              <p className="text-sm text-ts-text-main whitespace-pre-wrap leading-relaxed">{post.text}</p>
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
