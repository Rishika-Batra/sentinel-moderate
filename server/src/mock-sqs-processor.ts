import { Post } from './models/Post';
import { comprehendClient, rekognitionClient, BUCKET_NAME } from './aws';
import { DetectSentimentCommand, DetectPiiEntitiesCommand } from '@aws-sdk/client-comprehend';
import { DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import { parseTextModeration } from './textParser';
import { keywordModeration } from './keywordFallback';
import { parseModerationLabels } from './rekognitionParser';

const getWorstStatus = (status1: string, status2: string) => {
  const levels: Record<string, number> = { 'clean': 0, 'needs_review': 1, 'flagged': 2 };
  const val1 = levels[status1] ?? 1;
  const val2 = levels[status2] ?? 1;
  return val1 >= val2 ? status1 : status2;
};

export const processMockMessage = async (messageBody: string) => {
  try {
    const payload = JSON.parse(messageBody);
    const { postId, hasImage, s3Key, hasText, textData } = payload;
    if (!postId) return;

    console.log(`[SQS Processor] Evaluating post: ${postId}`);

    let finalVerdict = 'needs_review';
    let aiVerdict: Record<string, any> = {};

    // 1. Text Moderation
    if (hasText && textData) {
      try {
        const sentimentCommand = new DetectSentimentCommand({ Text: textData, LanguageCode: 'en' });
        const piiCommand = new DetectPiiEntitiesCommand({ Text: textData, LanguageCode: 'en' });

        const [sentimentRes, piiRes] = await Promise.all([
          comprehendClient.send(sentimentCommand),
          comprehendClient.send(piiCommand)
        ]);

        const parsed = parseTextModeration(textData, sentimentRes, piiRes.Entities || []);
        aiVerdict.textAnalysis = {
          toxicityScore: parsed.toxicityScore,
          sentiment: parsed.sentiment,
          categories: parsed.categories,
          status: parsed.status,
          method: 'comprehend'
        };
        finalVerdict = getWorstStatus(finalVerdict, parsed.status);
      } catch (comprehendError) {
        console.warn('[SQS Processor] Comprehend fallback to keyword moderation');
        const fallback = keywordModeration(textData);
        aiVerdict.textAnalysis = {
          toxicityScore: fallback.status === 'flagged' ? 0.9 : 0.5,
          sentiment: 'UNKNOWN',
          categories: fallback.matchedKeywords,
          status: fallback.status,
          method: fallback.method
        };
        finalVerdict = getWorstStatus(finalVerdict, fallback.status);
      }
    }

    // 2. Image Moderation
    if (hasImage && s3Key && BUCKET_NAME) {
      try {
        const command = new DetectModerationLabelsCommand({
          Image: { S3Object: { Bucket: BUCKET_NAME, Name: s3Key } }
        });
        const response = await rekognitionClient.send(command);
        const parsed = parseModerationLabels(response.ModerationLabels || []);
        aiVerdict.imageAnalysis = { moderationLabels: parsed.moderationLabels, status: parsed.status };
        finalVerdict = getWorstStatus(finalVerdict, parsed.status);
      } catch (rekError) {
        console.warn('[SQS Processor] Rekognition unavailable:', (rekError as Error).message);
      }
    }

    aiVerdict.finalVerdict = finalVerdict;
    aiVerdict.processedAt = new Date().toISOString();

    // Update Post in MongoDB
    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        status: finalVerdict,
        aiVerdict
      },
      { new: true }
    );

    if (post) {
      console.log(`[SQS Processor] Successfully processed post ${post._id} -> status: '${finalVerdict}'`);
    }

  } catch (error) {
    console.error(`[SQS Processor] Error processing post:`, error);
  }
};
