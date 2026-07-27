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
  'hate', 'kill', 'murder', 'idiot', 'stupid', 'dumb', 'violence', 'terror'
];

export const parseTextModeration = (text: string, sentimentData: SentimentResponse, piiData: PiiEntity[]) => {
  let status = 'clean';
  let categories: string[] = [];
  let toxicityScore = 0;

  // 1. Keyword-based toxicity fallback
  const lowerText = text.toLowerCase();
  for (const keyword of TOXIC_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      status = 'flagged';
      categories.push('toxic_keyword_detected');
      toxicityScore = 0.99; // Mock high toxicity
      break;
    }
  }

  // 2. Sentiment analysis check
  if (status !== 'flagged' && sentimentData.Sentiment === 'NEGATIVE') {
    const negativeScore = sentimentData.SentimentScore?.Negative || 0;
    if (negativeScore > 0.8) {
      status = 'needs_review';
      categories.push('highly_negative_sentiment');
    }
  }

  // 3. PII Detection Check
  const highRiskPiiTypes = ['CREDIT_CARD', 'SSN', 'BANK_ACCOUNT_NUMBER', 'PASSWORD'];
  const detectedPii = piiData.filter(entity => 
    entity.Type && highRiskPiiTypes.includes(entity.Type) && (entity.Score || 0) > 0.8
  );

  if (detectedPii.length > 0) {
    status = 'flagged'; // PII is usually a strict violation
    categories.push('sensitive_pii_detected');
  }

  return {
    status,
    toxicityScore,
    sentiment: sentimentData.Sentiment,
    categories
  };
};
