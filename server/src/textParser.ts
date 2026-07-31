export interface SentimentResponse {
  Sentiment?: string;
  SentimentScore?: {
    Positive?: number;
    Negative?: number;
    Neutral?: number;
    Mixed?: number;
  };
}

export interface PiiEntity {
  Type?: string;
  Score?: number;
}

const TOXIC_KEYWORDS = [
  'hate', 'kill', 'murder', 'idiot', 'stupid', 'dumb', 'violence', 'terror', 'bomb', 'threat'
];

export const parseTextModeration = (text: string, sentimentData: SentimentResponse, piiData: PiiEntity[]) => {
  let status = 'needs_review';
  let categories: string[] = [];
  let toxicityScore = 0.1;

  // 1. Keyword-based toxicity fallback
  const lowerText = text.toLowerCase();
  for (const keyword of TOXIC_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      status = 'flagged';
      categories.push('toxic_keyword_detected');
      toxicityScore = 0.95;
      break;
    }
  }

  // 2. Sentiment analysis check
  if (status !== 'flagged' && sentimentData.Sentiment === 'NEGATIVE') {
    const negativeScore = sentimentData.SentimentScore?.Negative || 0;
    if (negativeScore > 0.6) {
      status = 'needs_review';
      categories.push('negative_sentiment');
      toxicityScore = Math.max(toxicityScore, negativeScore);
    }
  }

  // 3. PII Detection Check
  const highRiskPiiTypes = ['CREDIT_CARD', 'SSN', 'BANK_ACCOUNT_NUMBER', 'PASSWORD', 'EMAIL', 'PHONE'];
  const detectedPii = piiData.filter(entity => 
    entity.Type && highRiskPiiTypes.includes(entity.Type) && (entity.Score || 0) > 0.7
  );

  if (detectedPii.length > 0) {
    status = 'flagged';
    categories.push('sensitive_pii_detected');
  }

  return {
    status,
    toxicityScore,
    sentiment: sentimentData.Sentiment || 'NEUTRAL',
    categories
  };
};
