// Local video composition test
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const os = require('os');

async function testLocalComposition() {
  try {
    console.log('🧪 Testing local video composition...');

    const baseDir = 'C:\\Users\\hanim\\OneDrive\\Desktop\\loom.ai';
    const videoPath = path.join(baseDir, 'WIN_20250918_00_00_29_Pro.mp4');
    const imagePath = path.join(baseDir, 'screenshot-66c80a46-6f3c-4987-aa56-6d5ef7517d50.png');
    const tempDir = os.tmpdir();

    // Step 1: Create background video from screenshot
    console.log('📜 Creating background video from screenshot...');
    const backgroundPath = path.join(tempDir, `bg-${Date.now()}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions(['-loop 1'])
        .videoFilters([
          'scale=1920:1080:force_original_aspect_ratio=decrease',
          'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black'
        ])
        .videoCodec('libx264')
        .format('mp4')
        .fps(30)
        .duration(10) // 10 second test
        .output(backgroundPath)
        .on('start', (cmd) => console.log('Background command:', cmd))
        .on('progress', (progress) => console.log('Background:', progress.percent + '%'))
        .on('end', () => {
          console.log('✅ Background created:', backgroundPath);
          resolve();
        })
        .on('error', reject)
        .run();
    });

    // Step 2: Create circular/square overlay from talking head video
    console.log('🟣 Creating video overlay...');
    const overlayPath = path.join(tempDir, `overlay-${Date.now()}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters([
          'scale=300:300:force_original_aspect_ratio=increase',
          'crop=300:300'
        ])
        .videoCodec('libx264')
        .format('mp4')
        .fps(30)
        .duration(10)
        .output(overlayPath)
        .on('start', (cmd) => console.log('Overlay command:', cmd))
        .on('progress', (progress) => console.log('Overlay:', progress.percent + '%'))
        .on('end', () => {
          console.log('✅ Overlay created:', overlayPath);
          resolve();
        })
        .on('error', reject)
        .run();
    });

    // Step 3: Compose final video
    console.log('🎭 Composing final video...');
    const finalPath = path.join(tempDir, `test-output-${Date.now()}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(backgroundPath)
        .input(overlayPath)
        .complexFilter([
          '[0:v][1:v]overlay=W-w-50:H-h-50:enable=\'between(t,0,10)\'[final]'
        ])
        .map('[final]')
        .map('[1:a]') // Use audio from overlay video
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .fps(30)
        .duration(10)
        .output(finalPath)
        .on('start', (cmd) => console.log('Final command:', cmd))
        .on('progress', (progress) => console.log('Final:', progress.percent + '%'))
        .on('end', async () => {
          console.log('✅ Final video created:', finalPath);

          // Copy to project directory for easier viewing
          const fs = require('fs');
          const projectOutput = path.join(baseDir, 'test-output.mp4');
          fs.copyFileSync(finalPath, projectOutput);
          console.log('📁 Copied to:', projectOutput);
          console.log('🎉 Test completed! Check the output file.');
          resolve();
        })
        .on('error', reject)
        .run();
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLocalComposition();