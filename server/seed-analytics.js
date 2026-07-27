const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const PostSchema = new mongoose.Schema({
  userId: String,
  text: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  status: String,
  aiVerdict: mongoose.Schema.Types.Mixed,
  adminReview: mongoose.Schema.Types.Mixed
});

// Avoid OverwriteModelError
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in ../.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  console.log('Clearing existing posts...');
  await Post.deleteMany({});

  const posts = [];
  const now = new Date().getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const categories = [
    'toxic_keyword', 
    'Explicit Nudity', 
    'Violence', 
    'highly_negative_sentiment', 
    'sensitive_pii'
  ];

  for (let i = 0; i < 150; i++) {
    // Generate a random date within the last 30 days, weighted slightly towards recent
    const randomOffset = Math.floor(Math.random() * thirtyDaysMs);
    const createdAt = new Date(now - randomOffset);
    
    // Simulate admin review happening 1-5 hours later
    const reviewOffset = Math.floor(Math.random() * (5 * 60 * 60 * 1000)) + (60 * 60 * 1000);
    const reviewedAt = new Date(createdAt.getTime() + reviewOffset);

    const isClean = Math.random() > 0.4;
    const isFlagged = !isClean && Math.random() > 0.5;
    const status = isClean ? 'clean' : (isFlagged ? 'flagged' : 'needs_review');
    
    let aiVerdict = {
      finalVerdict: status,
      processedAt: createdAt.toISOString(),
      textAnalysis: { categories: [] }
    };

    if (!isClean) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      aiVerdict.textAnalysis.categories.push(cat);
    }

    // 95% of the time, the admin agrees with the AI (overrodeAI = false)
    const adminAgrees = Math.random() < 0.95;
    let adminDecision = status === 'clean' ? 'approved' : 'removed';
    if (!adminAgrees) {
      adminDecision = status === 'clean' ? 'removed' : 'approved';
    }

    const post = new Post({
      userId: `user-${Math.floor(Math.random() * 1000)}`,
      text: `Auto-generated test post #${i}`,
      createdAt,
      status: status === 'clean' ? status : 'reviewed',
      aiVerdict,
      adminReview: status !== 'clean' ? {
        decision: adminDecision,
        reviewedAt: reviewedAt.toISOString(),
        reviewedBy: 'admin',
        overrodeAI: !adminAgrees
      } : undefined
    });

    posts.push(post);
  }

  // Sort sequentially just for cleanliness
  posts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  await Post.insertMany(posts);
  console.log(`Seeded ${posts.length} posts for the analytics dashboard!`);

  mongoose.disconnect();
}

seed();
