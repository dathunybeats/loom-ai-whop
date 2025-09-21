// Test script for video composition - run with: node test-video-composition.js
import { composePersonalizedVideoReal } from './src/lib/video-composition.ts';
import path from 'path';

async function testVideoComposition() {
  try {
    console.log('🧪 Testing video composition...');

    // Test with sample files (you'll need to provide these)
    const testOptions = {
      baseVideoPath: 'https://example.com/sample-video.mp4', // Replace with actual video URL
      backgroundImagePath: 'https://example.com/sample-screenshot.png', // Replace with actual image URL
      outputPath: path.join(process.cwd(), 'test-output.mp4'),
      position: 'bottom-right',
      size: 200,
      duration: 10, // Short test duration
      projectId: 'test-project'
    };

    const result = await composePersonalizedVideoReal(testOptions);

    if (result.success) {
      console.log('✅ Test successful!');
      console.log('Output:', result.outputPath);
    } else {
      console.log('❌ Test failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Uncomment to run test
// testVideoComposition();

console.log('📋 To test video composition:');
console.log('1. Replace the URLs above with actual video/image URLs');
console.log('2. Uncomment the testVideoComposition() call');
console.log('3. Run: node test-video-composition.js');