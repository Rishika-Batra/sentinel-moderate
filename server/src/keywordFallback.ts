// Lightweight keyword-based text moderation fallback.
// Used when Comprehend is unavailable or for local development.

const FLAGGED_KEYWORDS = [
  'kill', 'murder', 'suicide', 'rape', 'terrorist', 'bomb', 'gun', 'attack', 'weapon', 'die', 'threat'
];

const MILD_FLAGS = [
  'hate', 'stupid', 'idiot', 'shut up', 'fake', 'scam', 'fraud', 'abuse', 'terrible', 'bad', 'complaint', 'report', 'issue', 'violation', 'spam', 'crap', 'garbage', 'worst'
];

export interface KeywordModerationResult {
  status: 'clean' | 'needs_review' | 'flagged';
  matchedKeywords: string[];
  method: 'keyword_fallback';
}

export const keywordModeration = (text: string): KeywordModerationResult => {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  for (const word of FLAGGED_KEYWORDS) {
    if (lowerText.includes(word)) matched.push(word);
  }

  if (matched.length > 0) {
    return { status: 'flagged', matchedKeywords: matched, method: 'keyword_fallback' };
  }

  const mildMatched: string[] = [];
  for (const word of MILD_FLAGS) {
    if (lowerText.includes(word)) mildMatched.push(word);
  }

  if (mildMatched.length > 0) {
    return { status: 'needs_review', matchedKeywords: mildMatched, method: 'keyword_fallback' };
  }

  // Default to needs_review for general complaints/submissions so admins can review all submitted posts
  return { status: 'needs_review', matchedKeywords: [], method: 'keyword_fallback' };
};
