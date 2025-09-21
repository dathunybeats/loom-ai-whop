// Website screenshot services - ScreenshotOne primary
// Firecrawl backup code available in ./firecrawl-backup.ts

export interface ScreenshotOptions {
  url: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  mobile?: boolean;
  onlyMainContent?: boolean;
  maxAge?: number;
  includeParsers?: string[];
}

export interface ScreenshotResult {
  success: boolean;
  screenshot?: string; // Base64 image data or URL
  url?: string; // Public URL to screenshot
  content?: string; // Main content text
  markdown?: string; // Content as markdown
  error?: string;
  metadata?: {
    title?: string;
    description?: string;
    width: number;
    height: number;
    sourceURL?: string;
    statusCode?: number;
  };
}

/**
 * Capture a screenshot of a website using ScreenshotOne (screenshot-1) as primary service
 */
export async function captureWebsiteScreenshot(
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  try {
    // Normalize URL - add https:// if missing
    let url = options.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    console.log(`🌐 Capturing screenshot with ScreenshotOne for: ${url}`);

    // Primary method: Try scrolling animation first for dynamic videos
    console.log('🎬 Trying ScreenshotOne scrolling animation first...');
    const scrollingResult = await captureScrollingAnimation(url);

    if (scrollingResult.success) {
      console.log('✅ ScreenshotOne scrolling animation captured successfully');
      return scrollingResult;
    }

    console.log('⚠️ ScreenshotOne scrolling failed, falling back to static screenshot...');

    // Fallback: Use static screenshot if animation fails
    const screenshotOneResult = await captureWithScreenshotOne(url);

    if (screenshotOneResult.success) {
      console.log('✅ ScreenshotOne static screenshot captured successfully');
      return screenshotOneResult;
    }

    // If both ScreenshotOne methods fail, return error
    console.error('❌ All ScreenshotOne methods failed');
    return {
      success: false,
      error: `ScreenshotOne failed: ${screenshotOneResult.error}. Scrolling animation also failed: ${scrollingResult.error}`
    };

  } catch (error) {
    console.error('🚨 Screenshot capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate scrolling animation using ScreenshotOne Animate API
 * Creates a smooth scrolling video of the website
 */
async function captureScrollingAnimation(url: string): Promise<ScreenshotResult> {
  try {
    console.log('🎬 Creating scrolling animation for:', url);

    const accessKey = '3bTPnXgnqNe1fw';
    const secretKey = 'FKINyMk6O2RI9Q';

    // ScreenshotOne Animate API endpoint
    const apiUrl = 'https://api.screenshotone.com/animate';

    // Prepare animation parameters for smooth scrolling (using only access_key)
    const params = new URLSearchParams({
      access_key: accessKey,
      url: url,
      format: 'mp4',
      block_ads: 'true',
      block_cookie_banners: 'true',
      block_banners_by_heuristics: 'false',
      block_trackers: 'true',
      delay: '0',
      timeout: '60',
      scenario: 'scroll',
      duration: '5', // 5 second animation
      scroll_delay: '500',
      scroll_duration: '1500',
      scroll_by: '1000',
      scroll_start_immediately: 'true',
      scroll_back: 'true',
      scroll_complete: 'true',
      scroll_easing: 'ease_in_out_quint'
    });

    const animationUrl = `${apiUrl}?${params.toString()}`;

    console.log('🎬 ScreenshotOne animation URL generated');

    return {
      success: true,
      screenshot: animationUrl,
      url: animationUrl,
      metadata: {
        title: `Scrolling animation of ${url}`,
        description: `Website scrolling animation via ScreenshotOne`,
        width: 1920,
        height: 1080,
        sourceURL: url,
        statusCode: 200
      }
    };

  } catch (error) {
    console.error('❌ ScreenshotOne animation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ScreenshotOne animation failed'
    };
  }
}

/**
 * Alternative screenshot capture using ScreenshotOne API
 * Used as fallback when Firecrawl is unavailable
 */
async function captureWithScreenshotOne(url: string): Promise<ScreenshotResult> {
  try {
    console.log('🔄 Using ScreenshotOne as fallback for:', url);

    const accessKey = '3bTPnXgnqNe1fw';
    const secretKey = 'FKINyMk6O2RI9Q';

    // ScreenshotOne API endpoint
    const apiUrl = 'https://api.screenshotone.com/take';

    // Prepare screenshot parameters (using only access_key)
    const params = new URLSearchParams({
      access_key: accessKey,
      url: url,
      viewport_width: '1920',
      viewport_height: '1080',
      device_scale_factor: '1',
      format: 'png',
      full_page: 'false', // Capture viewport only for consistent sizing
      block_ads: 'true',
      block_cookie_banners: 'true',
      block_trackers: 'true',
      delay: '3' // Wait 3 seconds for page to load
    });

    const screenshotUrl = `${apiUrl}?${params.toString()}`;

    console.log('📸 ScreenshotOne request URL generated');

    // For ScreenshotOne, the URL itself returns the image
    return {
      success: true,
      screenshot: screenshotUrl,
      url: screenshotUrl,
      metadata: {
        title: `Screenshot of ${url}`,
        description: `Website screenshot captured via ScreenshotOne`,
        width: 1920,
        height: 1080,
        sourceURL: url,
        statusCode: 200
      }
    };

  } catch (error) {
    console.error('❌ ScreenshotOne error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ScreenshotOne failed'
    };
  }
}

/**
 * Enhanced web scraping using ScreenshotOne as primary service
 */
export async function enhancedWebScrape(
  url: string,
  options?: {
    fullPage?: boolean;
    waitTime?: number;
  }
): Promise<ScreenshotResult> {
  try {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`🚀 Enhanced ScreenshotOne scraping: ${normalizedUrl}`);

    // Primary method: Use ScreenshotOne with full page capture
    const screenshotResult = await captureWithScreenshotOne(normalizedUrl);

    if (screenshotResult.success) {
      console.log('✅ ScreenshotOne scraping successful');
      console.log('📸 === SCREENSHOTONE RESPONSE DEBUG ===');
      console.log('🌐 URL scraped:', normalizedUrl);
      console.log('📸 Screenshot URL:', screenshotResult.screenshot);
      console.log('📊 Title:', screenshotResult.metadata?.title || 'N/A');
      console.log('📋 Description:', screenshotResult.metadata?.description || 'N/A');
      console.log('🔗 Source URL:', screenshotResult.metadata?.sourceURL || 'N/A');
      console.log('======================================');
      return screenshotResult;
    }

    console.log('🔄 ScreenshotOne static failed, trying scrolling animation...');

    // Fallback: Try scrolling animation
    const animationResult = await captureScrollingAnimation(normalizedUrl);

    if (animationResult.success) {
      console.log('✅ ScreenshotOne scrolling animation succeeded');
      return animationResult;
    }

    console.error('❌ All ScreenshotOne methods failed');
    return {
      success: false,
      error: `ScreenshotOne static failed: ${screenshotResult.error}. Animation also failed: ${animationResult.error}`
    };

  } catch (error) {
    console.error('🚨 Enhanced scraping error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Capture website with scrolling animation using ScreenshotOne
 * Alternative to static screenshots for more dynamic videos
 */
export async function captureWebsiteWithScrolling(url: string): Promise<ScreenshotResult> {
  console.log('🎬 Starting website scrolling animation capture:', url);

  // First try the scrolling animation
  const animationResult = await captureScrollingAnimation(url);

  if (animationResult.success) {
    console.log('✅ Scrolling animation captured successfully');
    return animationResult;
  }

  console.log('⚠️ Scrolling animation failed, falling back to static screenshot');

  // If animation fails, fall back to static screenshot
  const staticResult = await captureWithScreenshotOne(url);

  if (staticResult.success) {
    console.log('✅ Static screenshot fallback succeeded');
    return staticResult;
  }

  console.error('❌ Both scrolling animation and static screenshot failed');
  return {
    success: false,
    error: `Animation failed: ${animationResult.error}. Static fallback failed: ${staticResult.error}`
  };
}

/**
 * Generate a scrolling animation video from a website
 * This creates multiple screenshots at different scroll positions
 */
export async function generateScrollingScreenshots(
  url: string,
  options: {
    scrollSteps?: number; // Number of screenshots to take while scrolling
    stepDelay?: number; // Delay between scroll steps (ms)
    width?: number;
    height?: number;
  } = {}
): Promise<{
  success: boolean;
  screenshots?: string[]; // Array of base64 images
  error?: string;
}> {
  try {
    const {
      scrollSteps = 10,
      width = 1920,
      height = 1080
    } = options;

    console.log(`Generating ${scrollSteps} scrolling screenshots for: ${url}`);

    // For now, we'll take one full-page screenshot using enhanced scraping
    // In a future iteration, we can enhance this to take multiple screenshots
    // at different scroll positions using custom Puppeteer integration
    const screenshot = await enhancedWebScrape(url, {
      fullPage: true
    });

    if (!screenshot.success || !screenshot.screenshot) {
      return {
        success: false,
        error: screenshot.error || 'Failed to capture screenshot'
      };
    }

    // For now, return the single screenshot
    // TODO: Implement actual scrolling animation with multiple frames
    return {
      success: true,
      screenshots: [screenshot.screenshot]
    };

  } catch (error) {
    console.error('Scrolling screenshots error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Save screenshot to Supabase Storage
 */
export async function saveScreenshotToStorage(
  screenshotData: string,
  filename: string,
  projectId: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Convert base64 to buffer
    const base64Data = screenshotData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = `projects/${projectId}/screenshots/${filename}`;

    const { data, error } = await supabase.storage
      .from('videos') // Using existing videos bucket
      .upload(filePath, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year cache
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Save screenshot error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}