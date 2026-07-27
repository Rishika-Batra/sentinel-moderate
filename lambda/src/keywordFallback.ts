// Lightweight keyword-based text moderation fallback.
// Used when Comprehend is unavailable (e.g. account not subscribed to the service).
// This is NOT a replacement for real NLP toxicity detection — it's a coarse safety net
// so the system degrades gracefully instead of blindly flagging everything for manual review.

const FLAGGED_KEYWORDS = [
  'kill', 'murder', 'suicide', 'rape', 'terrorist', 'bomb',
];

const MILD_FLAGS = [
  'hate', 'stupid', 'idiot', 'shut up',
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

  return { status: 'clean', matchedKeywords: [], method: 'keyword_fallback' };
};
