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

const Post = mongoose.model('Post', PostSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const flaggedPost = new Post({
    userId: 'mock-user-1',
    text: 'I will find and destroy you! My credit card is 1111-2222-3333-4444',
    status: 'flagged',
    aiVerdict: {
      finalVerdict: 'flagged',
      processedAt: new Date().toISOString(),
      textAnalysis: {
        sentiment: 'NEGATIVE',
        toxicityScore: 0.99,
        categories: ['toxic_keyword_detected', 'sensitive_pii_detected']
      }
    }
  });

  const needsReviewPost = new Post({
    userId: 'mock-user-2',
    text: 'I am so incredibly frustrated with this service today.',
    status: 'needs_review',
    aiVerdict: {
      finalVerdict: 'needs_review',
      processedAt: new Date().toISOString(),
      textAnalysis: {
        sentiment: 'NEGATIVE',
        toxicityScore: 0,
        categories: ['highly_negative_sentiment']
      }
    }
  });

  await flaggedPost.save();
  await needsReviewPost.save();

  console.log('Seeded 2 mock posts into the database!');
  mongoose.disconnect();
}

seed();
