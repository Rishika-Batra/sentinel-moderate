import { parseTextModeration, SentimentResponse, PiiEntity } from './src/textParser';

const runTests = () => {
  console.log('--- Running Text Moderation Logic Tests ---\n');

  // Test Case 1: Clean Text
  const cleanText = "This is a wonderful sunny day! I love this platform.";
  const cleanSentiment: SentimentResponse = { Sentiment: 'POSITIVE' };
  const cleanPii: PiiEntity[] = [];
  const cleanResult = parseTextModeration(cleanText, cleanSentiment, cleanPii);
  console.log('Test 1 - Clean Text (Expected: clean):');
  console.log(`Result: ${cleanResult.status}`);
  console.log(`Passed: ${cleanResult.status === 'clean'}\n`);

  // Test Case 2: Highly Negative Sentiment
  const angryText = "I am so incredibly angry and frustrated with everything today.";
  const angrySentiment: SentimentResponse = { Sentiment: 'NEGATIVE', SentimentScore: { Negative: 0.95 } };
  const angryPii: PiiEntity[] = [];
  const angryResult = parseTextModeration(angryText, angrySentiment, angryPii);
  console.log('Test 2 - Negative Sentiment (Expected: needs_review):');
  console.log(`Result: ${angryResult.status}`);
  console.log(`Passed: ${angryResult.status === 'needs_review'}\n`);

  // Test Case 3: Toxic Keyword Fallback
  const toxicText = "I will find and murder you!";
  const toxicSentiment: SentimentResponse = { Sentiment: 'NEGATIVE', SentimentScore: { Negative: 0.99 } };
  const toxicPii: PiiEntity[] = [];
  const toxicResult = parseTextModeration(toxicText, toxicSentiment, toxicPii);
  console.log('Test 3 - Toxic Keyword (Expected: flagged):');
  console.log(`Result: ${toxicResult.status}`);
  console.log(`Passed: ${toxicResult.status === 'flagged'}\n`);

  // Test Case 4: High-Risk PII
  const piiText = "My credit card number is 4532 1111 2222 3333";
  const piiSentiment: SentimentResponse = { Sentiment: 'NEUTRAL' };
  const piiEntities: PiiEntity[] = [{ Type: 'CREDIT_CARD', Score: 0.99 }];
  const piiResult = parseTextModeration(piiText, piiSentiment, piiEntities);
  console.log('Test 4 - PII Entity (Expected: flagged):');
  console.log(`Result: ${piiResult.status}`);
  console.log(`Passed: ${piiResult.status === 'flagged'}\n`);
};

runTests();
