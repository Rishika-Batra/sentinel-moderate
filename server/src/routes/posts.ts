import { Router } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { v4 as uuidv4 } from 'uuid';
import { s3Client, sqsClient, BUCKET_NAME, SQS_QUEUE_URL } from '../aws';
import { Post } from '../models/Post';
import { processMockMessage } from '../mock-sqs-processor';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/posts
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { text, userId } = req.body;
    let imageUrl = undefined;

    // Handle image upload to S3 if present
    let key: string | undefined = undefined;
    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop();
      key = `uploads/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);
      
      const region = process.env.AWS_REGION || 'ap-south-1';
      imageUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
    }

    // Save post to MongoDB
    const post = new Post({
      userId: userId || 'anonymous', // Default for now
      text,
      imageUrl,
      status: 'pending'
    });

    await post.save();
    
    // Push message to SQS Queue
    const messageBody = JSON.stringify({
      postId: post._id,
      hasImage: !!imageUrl,
      hasText: !!text,
      textData: text || undefined,
      s3Bucket: key ? BUCKET_NAME : undefined,
      s3Key: key,
    });

    if (process.env.USE_MOCK_SQS === 'true') {
      console.log('Sending message to Mock SQS Processor:', messageBody);
      // Process asynchronously without awaiting so response returns immediately
      processMockMessage(messageBody).catch(console.error);
    } else {
      console.log(`Sending message to real SQS Queue: ${SQS_QUEUE_URL}`);
      await sqsClient.send(new SendMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MessageBody: messageBody,
      }));
    }

    return res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/posts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    return res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router;
