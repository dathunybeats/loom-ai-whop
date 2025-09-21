import { NextRequest, NextResponse } from 'next/server';
import { enhancedWebScrape } from '@/lib/website-screenshot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUrl = searchParams.get('url') || 'https://www.imperiumacquisition.com/';

    console.log('🧪 Testing enhanced web scraping for:', testUrl);
    console.log('🔗 This will show you the exact screenshot URL from ScreenshotOne...');

    const result = await enhancedWebScrape(testUrl, {
      fullPage: true,
      waitTime: 3000
    });

    // 🔍 EXTRA CONSOLE LOGGING FOR DEBUGGING
    console.log('📸 === TEST SCREENSHOT URL DEBUG ===');
    console.log('🌐 Test URL:', testUrl);
    console.log('📸 Screenshot URL:', result.screenshot);
    console.log('📊 Title:', result.metadata?.title);
    console.log('📋 Description:', result.metadata?.description);
    console.log('📄 Content preview:', result.content?.substring(0, 200) + '...');
    console.log('==================================');

    return NextResponse.json({
      success: true,
      testUrl,
      screenshotUrl: result.screenshot, // Make this prominent in response
      screenshotOneResult: {
        success: result.success,
        hasScreenshot: !!result.screenshot,
        screenshotUrl: result.screenshot,
        hasContent: !!result.content,
        contentLength: result.content?.length || 0,
        hasMarkdown: !!result.markdown,
        markdownLength: result.markdown?.length || 0,
        metadata: result.metadata,
        error: result.error
      },
      message: result.success
        ? `✅ ScreenshotOne working! Screenshot URL: ${result.screenshot}`
        : '❌ ScreenshotOne failed - check configuration'
    });

  } catch (error) {
    console.error('🚨 Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '❌ ScreenshotOne test failed - check server logs'
    }, { status: 500 });
  }
}
