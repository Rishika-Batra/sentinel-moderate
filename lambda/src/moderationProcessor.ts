import { SQSEvent, SQSHandler } from 'aws-lambda';
import { MongoClient, ObjectId } from 'mongodb';
import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import { ComprehendClient, DetectSentimentCommand, DetectPiiEntitiesCommand } from '@aws-sdk/client-comprehend';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { parseModerationLabels } from './rekognitionParser';
import { parseTextModeration } from './textParser';
import { keywordModeration } from './keywordFallback';

let cachedClient: MongoClient | null = null;

const connectToDatabase = async () => {
  if (cachedClient) return cachedClient;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  cachedClient = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
  await cachedClient.connect();
  return cachedClient;
};

const awsRegion = process.env.AWS_REGION || 'ap-south-1';
const rekognition = new RekognitionClient({ region: awsRegion });
const comprehend = new ComprehendClient({ region: awsRegion });
const snsClient = new SNSClient({ region: awsRegion });

// Helper to determine the worst status
const getWorstStatus = (status1: string, status2: string) => {
  const levels: Record<string, number> = { 'clean': 0, 'needs_review': 1, 'flagged': 2 };
  const val1 = levels[status1] ?? 1; // default to needs_review if unknown
  const val2 = levels[status2] ?? 1;
  return val1 >= val2 ? status1 : status2;
};

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log(`Received ${event.Records.length} SQS records`);

  const client = await connectToDatabase();
  const db = client.db();
  const postsCollection = db.collection('posts');

  for (const record of event.Records) {
    let finalVerdict = 'clean';
    let aiVerdict: Record<string, any> = {};

    let postId: string | null = null;

    try {
      console.log('Processing record body:', record.body);
      const payload = JSON.parse(record.body);
      postId = payload.postId;
      const { hasImage, s3Bucket, s3Key, hasText, textData } = payload;
      
      if (!postId) continue;

      const tasks: Promise<any>[] = [];

      // Task 1: Image Moderation
      if (hasImage && s3Bucket && s3Key) {
        const imageTask = (async () => {
          console.log(`Calling Rekognition for image s3://${s3Bucket}/${s3Key}`);
          const command = new DetectModerationLabelsCommand({
            Image: { S3Object: { Bucket: s3Bucket, Name: s3Key } }
          });
          const response = await rekognition.send(command);
          const parsed = parseModerationLabels(response.ModerationLabels || []);
          aiVerdict.imageAnalysis = { moderationLabels: parsed.moderationLabels, status: parsed.status };
          return parsed.status;
        })();
        tasks.push(imageTask);
      }

      // Task 2: Text Moderation
      if (hasText && textData) {
        const textTask = (async () => {
          console.log(`Calling Comprehend for text analysis`);
          try {
            const sentimentCommand = new DetectSentimentCommand({ Text: textData, LanguageCode: 'en' });
            const piiCommand = new DetectPiiEntitiesCommand({ Text: textData, LanguageCode: 'en' });

            const [sentimentRes, piiRes] = await Promise.all([
              comprehend.send(sentimentCommand),
              comprehend.send(piiCommand)
            ]);

            const parsed = parseTextModeration(textData, sentimentRes, piiRes.Entities || []);
            aiVerdict.textAnalysis = {
              toxicityScore: parsed.toxicityScore,
              sentiment: parsed.sentiment,
              categories: parsed.categories,
              status: parsed.status,
              method: 'comprehend'
            };
            return parsed.status;
          } catch (comprehendError) {
            console.warn('Comprehend unavailable, falling back to keyword moderation:', (comprehendError as Error).message);
            const fallback = keywordModeration(textData);
            aiVerdict.textAnalysis = {
              toxicityScore: fallback.status === 'flagged' ? 0.9 : fallback.status === 'needs_review' ? 0.5 : 0.1,
              sentiment: 'UNKNOWN',
              categories: fallback.matchedKeywords,
              status: fallback.status,
              method: fallback.method
            };
            return fallback.status;
          }
        })();
        tasks.push(textTask);
      }

      // Execute all AI tasks in parallel and safely handle errors
      const results = await Promise.allSettled(tasks);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          finalVerdict = getWorstStatus(finalVerdict, result.value);
        } else {
          console.error('AI API Call Failed:', result.reason);
          // Fallback to needs_review if any AI component crashes (e.g. rate limit, bad input)
          finalVerdict = getWorstStatus(finalVerdict, 'needs_review');
        }
      }

      aiVerdict.finalVerdict = finalVerdict;
      aiVerdict.processedAt = new Date().toISOString();

      // Calculate maxSeverityScore for alerting
      let maxSeverityScore = 0;
      if (aiVerdict.imageAnalysis?.moderationLabels) {
        for (const label of aiVerdict.imageAnalysis.moderationLabels) {
          if (label.confidence > maxSeverityScore) maxSeverityScore = label.confidence;
        }
      }
      if (aiVerdict.textAnalysis?.toxicityScore) {
        const textScore = aiVerdict.textAnalysis.toxicityScore * 100;
        if (textScore > maxSeverityScore) maxSeverityScore = textScore;
      }

      const updateResult = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { 
          $set: { 
            status: finalVerdict,
            aiVerdict
          } 
        }
      );

      console.log(`Successfully updated post ${postId} status to '${finalVerdict}'`);

      // SNS Alert Logic
      if (finalVerdict === 'flagged' && maxSeverityScore > 90) {
        if (process.env.SNS_TOPIC_ARN) {
          console.log(`High severity content detected (${maxSeverityScore}%). Sending SNS Alert.`);
          const adminUrl = 'http://localhost:5173/admin/queue'; // Ideally from env var
          const message = `🚨 HIGH SEVERITY CONTENT ALERT 🚨\n\n` +
                          `Post ID: ${postId}\n` +
                          `Severity Score: ${Math.round(maxSeverityScore)}%\n` +
                          `Triggered By: Image or Text violation > 90% confidence.\n\n` +
                          `Please review immediately: ${adminUrl}`;
          
          await snsClient.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Subject: 'High Severity Content Flagged',
            Message: message
          }));
        } else {
          console.warn('SNS_TOPIC_ARN not set. Skipping alert.');
        }
      }

    } catch (error) {
      console.error('Critical Error processing SQS record:', error);
      // If we crashed entirely but have a postId, attempt to safely set it to needs_review
      if (postId) {
        try {
          await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $set: { status: 'needs_review' } }
          );
        } catch(e) {
          console.error('Failed to set fallback status for post', postId, e);
        }
      }
    }
  }
};
