const ffmpeg = require('fluent-ffmpeg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configure S3 for file uploads
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * AWS Lambda function for video composition using FFmpeg
 * Replaces the local FFmpeg processing that doesn't work on Vercel
 */
exports.handler = async (event) => {
  console.log('🎬 Starting Lambda video composition...', JSON.stringify(event, null, 2));

  try {
    const {
      baseVideoUrl,
      backgroundImageUrl,
      position = 'bottom-right',
      size = 300,
      duration = 30,
      projectId
    } = JSON.parse(event.body || '{}');

    // Validate inputs
    if (!baseVideoUrl || !backgroundImageUrl || !projectId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing required parameters: baseVideoUrl, backgroundImageUrl, projectId'
        })
      };
    }

    console.log('📥 Downloading files...');

    // Download files to /tmp (Lambda's writable directory)
    const baseVideoPath = await downloadFile(baseVideoUrl, '/tmp/base-video.mp4');
    const backgroundPath = await downloadFile(backgroundImageUrl, '/tmp/background.png');

    console.log('✅ Files downloaded successfully');
    console.log('🎭 Starting video composition...');

    // Compose video using the same logic as your original FFmpeg code
    const outputPath = '/tmp/composed-video.mp4';
    await composeVideo(baseVideoPath, backgroundPath, outputPath, position, size);

    console.log('✅ Video composition completed');
    console.log('📤 Uploading to S3...');

    // Upload composed video to S3
    const s3Key = `compositions/${projectId}/video-${Date.now()}.mp4`;
    const uploadResult = await uploadToS3(outputPath, s3Key);

    console.log('✅ Upload completed:', uploadResult.Location);

    // Cleanup temp files
    cleanupFiles([baseVideoPath, backgroundPath, outputPath]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        videoUrl: uploadResult.Location,
        s3Key: s3Key
      })
    };

  } catch (error) {
    console.error('❌ Lambda composition error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Video composition failed'
      })
    };
  }
};

/**
 * Download file from URL to local path
 */
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading ${url} to ${outputPath}`);

    const file = fs.createWriteStream(outputPath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${outputPath}`);
        resolve(outputPath);
      });

      file.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Clean up on error
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Compose video using FFmpeg - same logic as your original code
 */
async function composeVideo(baseVideoPath, backgroundPath, outputPath, position, size) {
  return new Promise((resolve, reject) => {
    console.log('🎭 Starting FFmpeg composition...');

    // Calculate overlay position
    const overlayPosition = calculateOverlayPosition(position);

    // Detect if background is a video or image
    const isBackgroundVideo = backgroundPath.includes('.mp4') || backgroundPath.includes('animate');

    const command = ffmpeg()
      .input(backgroundPath) // Website screenshot/video
      .input(baseVideoPath); // Talking head video

    if (isBackgroundVideo) {
      // Background is a video
      command.complexFilter([
        '[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080[bg]',
        '[1:v]scale=1200:1200:force_original_aspect_ratio=increase,crop=1200:1200,format=yuva420p[highres]',
        '[highres]geq=lum=\'p(X,Y)\':a=\'if(lt(sqrt((X-600)*(X-600)+(Y-600)*(Y-600)),598),255,0)\'[highres_masked]',
        '[highres_masked]scale=300:300:flags=lanczos[masked]',
        `[bg][masked]overlay=${overlayPosition.x}:${overlayPosition.y}:enable='between(t,0,30)'[final]`
      ]);
    } else {
      // Background is a static image
      command.complexFilter([
        '[0:v]scale=1920:-1:force_original_aspect_ratio=increase,crop=1920:1080:0:0[bg]',
        '[1:v]scale=1200:1200:force_original_aspect_ratio=increase,crop=1200:1200,format=yuva420p[highres]',
        '[highres]geq=lum=\'p(X,Y)\':a=\'if(lt(sqrt((X-600)*(X-600)+(Y-600)*(Y-600)),598),255,0)\'[highres_masked]',
        '[highres_masked]scale=300:300:flags=lanczos[masked]',
        `[bg][masked]overlay=${overlayPosition.x}:${overlayPosition.y}:enable='between(t,0,30)'[final]`
      ]);
    }

    command
      .outputOptions([
        '-map', '[final]',
        '-map', '1:a', // Use audio from talking head video
        '-c:v', 'libx264',
        '-c:a', 'aac'
      ])
      .format('mp4')
      .fps(30)
      .duration(30)
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('🎬 FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`🎭 Progress: ${progress.percent || 0}%`);
      })
      .on('end', () => {
        console.log('✅ FFmpeg composition completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Calculate overlay position - same as your original code
 */
function calculateOverlayPosition(position) {
  const margin = 50;
  const positions = {
    'top-left': { x: margin, y: margin },
    'top-right': { x: 'W-w-50', y: margin },
    'bottom-left': { x: margin, y: 'H-h-50' },
    'bottom-right': { x: 'W-w-50', y: 'H-h-50' }
  };

  return positions[position] || positions['bottom-right'];
}

/**
 * Upload file to S3
 */
async function uploadToS3(filePath, s3Key) {
  const fileContent = fs.readFileSync(filePath);

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || 'your-video-bucket',
    Key: s3Key,
    Body: fileContent,
    ContentType: 'video/mp4',
    ACL: 'public-read'
  });

  const result = await s3.send(command);
  return {
    Location: `https://${process.env.S3_BUCKET || 'your-video-bucket'}.s3.amazonaws.com/${s3Key}`,
    ...result
  };
}

/**
 * Cleanup temporary files
 */
function cleanupFiles(filePaths) {
  filePaths.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up: ${filePath}`);
    } catch (error) {
      console.warn(`⚠️ Cleanup warning: ${filePath}`, error.message);
    }
  });
}