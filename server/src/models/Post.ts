import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  userId: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  status: 'pending' | 'processing' | 'clean' | 'needs_review' | 'flagged' | 'reviewed' | 'removed';
  aiVerdict: Record<string, any>;
  adminReview: Record<string, any>;
}

const PostSchema: Schema = new Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'clean', 'needs_review', 'flagged', 'reviewed', 'removed'], 
    default: 'pending' 
  },
  aiVerdict: { type: Schema.Types.Mixed, default: {} },
  adminReview: { type: Schema.Types.Mixed, default: {} }
});

export const Post = mongoose.model<IPost>('Post', PostSchema);
