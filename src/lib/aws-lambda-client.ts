import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Configure AWS SDK v3 (you'll set these in Vercel environment variables)
const lambda = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface LambdaVideoCompositionRequest {
  baseVideoUrl: string;
  backgroundImageUrl: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number;
  duration?: number;
  projectId: string;
}

export interface LambdaVideoCompositionResult {
  success: boolean;
  videoUrl?: string;
  s3Key?: string;
  error?: string;
}

/**
 * Call AWS Lambda function to compose video
 * This replaces your local FFmpeg processing
 */
export async function callLambdaVideoComposition(
  request: LambdaVideoCompositionRequest
): Promise<LambdaVideoCompositionResult> {
  try {
    console.log('🚀 Calling AWS Lambda for video composition...', request);

    const command = new InvokeCommand({
      FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'video-composition',
      InvocationType: 'RequestResponse', // Synchronous call
      Payload: JSON.stringify({
        body: JSON.stringify(request)
      })
    });

    const result = await lambda.send(command);

    if (result.StatusCode !== 200) {
      throw new Error(`Lambda invocation failed with status: ${result.StatusCode}`);
    }

    const payload = JSON.parse(new TextDecoder().decode(result.Payload));

    if (payload.statusCode !== 200) {
      throw new Error(`Lambda function failed: ${payload.body}`);
    }

    const response = JSON.parse(payload.body);

    console.log('✅ Lambda composition completed:', response);

    return response;

  } catch (error) {
    console.error('❌ Lambda composition error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Lambda error'
    };
  }
}

/**
 * Test Lambda connection (useful for debugging)
 */
export async function testLambdaConnection(): Promise<boolean> {
  try {
    const command = new InvokeCommand({
      FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'video-composition',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        body: JSON.stringify({ test: true })
      })
    });

    const result = await lambda.send(command);
    console.log('✅ Lambda connection test successful');
    return result.StatusCode === 200;

  } catch (error) {
    console.error('❌ Lambda connection test failed:', error);
    return false;
  }
}