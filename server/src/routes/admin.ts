import { Router } from 'express';
import { Post } from '../models/Post';

const router = Router();

// GET /api/admin/queue - Fetch flagged & needs_review posts
router.get('/queue', async (req, res) => {
  try {
    // Fetch all posts requiring manual admin moderation
    const posts = await Post.find({
      status: { $in: ['flagged', 'needs_review', 'pending', 'processing'] }
    }).sort({ createdAt: -1 });

    // Sort in memory to prioritize 'flagged' items first, then 'needs_review'
    posts.sort((a, b) => {
      if (a.status === 'flagged' && b.status !== 'flagged') return -1;
      if (b.status === 'flagged' && a.status !== 'flagged') return 1;
      if (a.status === 'needs_review' && (b.status === 'pending' || b.status === 'processing')) return -1;
      if (b.status === 'needs_review' && (a.status === 'pending' || a.status === 'processing')) return 1;
      return 0;
    });

    return res.json({ queue: posts });
  } catch (error) {
    console.error('Error fetching admin queue:', error);
    return res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// PATCH /api/admin/posts/:id - Approve or Remove post
router.patch('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'remove'

    if (!['approve', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be approve or remove.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const aiFinalVerdict = post.aiVerdict?.finalVerdict || post.status;
    
    // Determine if admin overrode AI
    let overrodeAI = false;
    if (aiFinalVerdict === 'flagged' && action === 'approve') {
      overrodeAI = true;
    } else if (aiFinalVerdict === 'clean' && action === 'remove') {
      overrodeAI = true;
    }

    // Update status and adminReview
    post.status = action === 'approve' ? 'reviewed' : 'removed';
    post.adminReview = {
      decision: action === 'approve' ? 'approved' : 'removed',
      overrodeAI,
      reviewedAt: new Date()
    };

    await post.save();
    return res.json(post);
  } catch (error) {
    console.error('Error reviewing post:', error);
    return res.status(500).json({ error: 'Failed to review post' });
  }
});

// GET /api/admin/analytics - Aggregated dashboard metrics
router.get('/analytics', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Total & Verdict Breakdown
    const totalPosts = await Post.countDocuments();
    const verdictCounts = await Post.aggregate([
      { $group: { _id: "$aiVerdict.finalVerdict", count: { $sum: 1 } } }
    ]);
    
    // 2. 30-Day Volume Trend
    const volumeTrend = await Post.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date ascending
    ]);

    // 3. Category Breakdown (Approximate by looking at text categories)
    // We unwind the text categories for a simple breakdown demo
    const categoryBreakdown = await Post.aggregate([
      { $unwind: "$aiVerdict.textAnalysis.categories" },
      { $group: { _id: "$aiVerdict.textAnalysis.categories", count: { $sum: 1 } } }
    ]);

    // 4. AI Accuracy & Avg Review Time
    const reviewedPosts = await Post.find({ "adminReview.decision": { $exists: true } });
    
    let accuracy = 0;
    let avgReviewTimeMs = 0;
    
    if (reviewedPosts.length > 0) {
      let agreedCount = 0;
      let totalTime = 0;
      
      reviewedPosts.forEach(post => {
        if (post.adminReview?.overrodeAI === false) agreedCount++;
        
        if (post.adminReview?.reviewedAt && post.createdAt) {
          totalTime += (new Date(post.adminReview.reviewedAt).getTime() - new Date(post.createdAt).getTime());
        }
      });
      
      accuracy = (agreedCount / reviewedPosts.length) * 100;
      avgReviewTimeMs = totalTime / reviewedPosts.length;
    }

    // Convert average review time to readable format (hours)
    const avgReviewTimeHours = avgReviewTimeMs / (1000 * 60 * 60);

    return res.json({
      totalPosts,
      verdictCounts,
      volumeTrend,
      categoryBreakdown,
      aiAccuracy: accuracy,
      avgReviewTimeHours
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
