import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api';

interface AdminPostCardProps {
  post: any;
  onReview: () => void;
  index?: number;
}

const AdminPostCard = ({ post, onReview, index = 0 }: AdminPostCardProps) => {
  const token = localStorage.getItem('adminToken');

  const handleAction = async (action: 'approve' | 'remove') => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/posts/${post._id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReview();
    } catch (err) {
      console.error('Failed to review post:', err);
      alert('Failed to process review.');
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

  return (
    <div 
      className="ts-card p-5 animate-fade-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="ts-label !mb-1">Post ID: {post._id}</span>
          <p className="mt-2 text-sm text-ts-textMain leading-relaxed">{post.text}</p>
        </div>
        {getStatusBadge(post.status)}
      </div>

      {post.imageUrl && (
        <div className="mb-5 rounded-lg overflow-hidden border border-ts-border bg-ts-bg">
          <img src={post.imageUrl} alt="User upload" className="w-full max-h-64 object-cover" />
        </div>
      )}

      {/* AI Verdict Section */}
      <div className="bg-ts-inputBg p-4 rounded-lg border border-ts-border mb-5">
        <h4 className="font-semibold text-sm text-ts-textMain mb-3 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-status-review" />
          AI Analysis Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-ts-textMuted">
          {post.aiVerdict?.imageAnalysis?.moderationLabels && (
            <div>
              <span className="font-medium text-ts-textMain">Image Labels:</span>
              <ul className="list-none mt-1 space-y-1">
                {post.aiVerdict.imageAnalysis.moderationLabels.length > 0 ? (
                  post.aiVerdict.imageAnalysis.moderationLabels.map((l: any, i: number) => (
                    <li key={i} className={l.confidence > 80 ? 'text-status-flagged' : ''}>
                      • {l.name} ({Math.round(l.confidence)}%)
                    </li>
                  ))
                ) : (
                  <li className="text-status-clean">• No concerning labels</li>
                )}
              </ul>
            </div>
          )}

          {post.aiVerdict?.textAnalysis && (
            <div>
              <span className="font-medium text-ts-textMain">Text Analysis:</span>
              <ul className="list-none mt-1 space-y-1">
                <li>• Sentiment: <span className="text-ts-textMain">{post.aiVerdict.textAnalysis.sentiment || 'N/A'}</span></li>
                {post.aiVerdict.textAnalysis.categories?.length > 0 && (
                  <li>• Flags: <span className="text-status-flagged">{post.aiVerdict.textAnalysis.categories.join(', ')}</span></li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-ts-border">
        <button 
          onClick={() => handleAction('approve')}
          className="ts-button-primary flex-1 flex justify-center items-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </button>
        <button 
          onClick={() => handleAction('remove')}
          className="ts-button-secondary border-status-flagged/30 text-status-flagged hover:bg-status-flagged/10 hover:text-status-flagged hover:border-status-flagged/60 flex-1 flex justify-center items-center"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Remove
        </button>
      </div>
    </div>
  );
};

export default AdminPostCard;
