export interface RekognitionLabel {
  Name?: string;
  Confidence?: number;
  ParentName?: string;
}

export const parseModerationLabels = (labels: RekognitionLabel[]) => {
  let status = 'clean';
  
  const parsedLabels = labels.map(label => ({
    name: label.Name,
    confidence: label.Confidence,
    parentName: label.ParentName
  }));

  for (const label of parsedLabels) {
    if (label.confidence && label.confidence > 80) {
      status = 'flagged';
      break;
    } else if (label.confidence && label.confidence >= 50 && label.confidence <= 80) {
      status = 'needs_review';
    }
  }

  return {
    status,
    moderationLabels: parsedLabels
  };
};
