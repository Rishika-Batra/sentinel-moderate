import { Post } from './models/Post';
import { connectDB } from './db';

// Simple mock processor that runs locally for testing the async flow
export const processMockMessage = async (messageBody: string) => {
  try {
    const payload = JSON.parse(messageBody);
    console.log(`[Mock SQS Processor] Received message for postId: ${payload.postId}`);

    // Wait 2 seconds to simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update status to 'processing'
    const post = await Post.findByIdAndUpdate(
      payload.postId,
      { status: 'processing' },
      { new: true }
    );

    if (post) {
      console.log(`[Mock SQS Processor] Successfully updated post ${post._id} status to 'processing'`);
    } else {
      console.warn(`[Mock SQS Processor] Post ${payload.postId} not found.`);
    }

  } catch (error) {
    console.error(`[Mock SQS Processor] Error processing message:`, error);
  }
};
