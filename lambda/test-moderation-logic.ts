import { parseModerationLabels, RekognitionLabel } from './src/rekognitionParser';

const runTests = () => {
  console.log('--- Running Moderation Logic Tests ---\n');

  // Test Case 1: Clean Image (No labels)
  const cleanImage: RekognitionLabel[] = [];
  const cleanResult = parseModerationLabels(cleanImage);
  console.log('Test 1 - Clean Image (Expected: clean):');
  console.log(`Result: ${cleanResult.status}`);
  console.log(`Passed: ${cleanResult.status === 'clean'}\n`);

  // Test Case 2: Medium Risk (50-80% confidence)
  const mediumRiskImage: RekognitionLabel[] = [
    { Name: 'Tobacco Products', Confidence: 65, ParentName: 'Drugs & Tobacco' },
    { Name: 'Drugs & Tobacco', Confidence: 65, ParentName: '' }
  ];
  const mediumResult = parseModerationLabels(mediumRiskImage);
  console.log('Test 2 - Medium Risk Image (Expected: needs_review):');
  console.log(`Result: ${mediumResult.status}`);
  console.log(`Passed: ${mediumResult.status === 'needs_review'}\n`);

  // Test Case 3: High Risk (>80% confidence)
  const highRiskImage: RekognitionLabel[] = [
    { Name: 'Explicit Nudity', Confidence: 98, ParentName: '' },
    { Name: 'Nudity', Confidence: 99, ParentName: 'Explicit Nudity' }
  ];
  const highResult = parseModerationLabels(highRiskImage);
  console.log('Test 3 - High Risk Image (Expected: flagged):');
  console.log(`Result: ${highResult.status}`);
  console.log(`Passed: ${highResult.status === 'flagged'}\n`);

  // Test Case 4: Mixed (Medium + High = High wins)
  const mixedImage: RekognitionLabel[] = [
    { Name: 'Alcohol', Confidence: 60, ParentName: '' },
    { Name: 'Violence', Confidence: 85, ParentName: '' }
  ];
  const mixedResult = parseModerationLabels(mixedImage);
  console.log('Test 4 - Mixed Risk Image (Expected: flagged):');
  console.log(`Result: ${mixedResult.status}`);
  console.log(`Passed: ${mixedResult.status === 'flagged'}\n`);
};

runTests();
