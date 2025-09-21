// BACKUP FILE: Original Firecrawl implementation
// Keep this file as backup in case we want to revert to Firecrawl
// This contains the original enhancedWebScrape function using Firecrawl API

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
 * BACKUP: Enhanced web scraping using direct Firecrawl API v2
 */
export async function enhancedWebScrapeFirecrawl(
  url: string,
  options?: {
    onlyMainContent?: boolean;
    maxAge?: number;
    parsers?: string[];
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

    console.log(`🚀 Enhanced Firecrawl scraping: ${normalizedUrl}`);

    const apiUrl = 'https://api.firecrawl.dev/v2/scrape';
    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: normalizedUrl,
        onlyMainContent: options?.onlyMainContent ?? true,
        maxAge: options?.maxAge ?? 172800000,
        parsers: options?.parsers ?? ['pdf'],
        formats: [
          {
            type: 'screenshot',
            fullPage: options?.fullPage ?? true
          }
        ],
        actions: [
          { type: 'wait', milliseconds: options?.waitTime ?? 3000 }
        ]
      })
    };

    console.log('📤 Sending request to Firecrawl API...');

    const response = await fetch(apiUrl, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Firecrawl API error:', data);
      return {
        success: false,
        error: `Firecrawl API error: ${data.error || 'Unknown error'}`
      };
    }

    console.log('✅ Firecrawl API response received');

    // Extract data from response
    const screenshotUrl = data.data?.screenshot;
    const content = data.data?.content;
    const markdown = data.data?.markdown;
    const metadata = data.data?.metadata;

    if (!screenshotUrl) {
      return {
        success: false,
        error: 'No screenshot URL returned from Firecrawl'
      };
    }

    console.log('📸 === FIRECRAWL RESPONSE DEBUG ===');
    console.log('🌐 URL scraped:', normalizedUrl);
    console.log('📸 Screenshot URL:', screenshotUrl);
    console.log('📄 Content length:', content ? content.length : 0);
    console.log('📝 Markdown length:', markdown ? markdown.length : 0);
    console.log('📊 Title:', metadata?.title || 'N/A');
    console.log('📋 Description:', metadata?.description || 'N/A');
    console.log('🔗 Source URL:', metadata?.sourceURL || 'N/A');
    console.log('📊 Status Code:', metadata?.statusCode || 'N/A');
    console.log('===================================');

    return {
      success: true,
      screenshot: screenshotUrl,
      url: screenshotUrl,
      content: content,
      markdown: markdown,
      metadata: {
        title: metadata?.title,
        description: metadata?.description,
        sourceURL: metadata?.sourceURL || normalizedUrl,
        statusCode: metadata?.statusCode,
        width: 1920, // Default values since this info might not be in response
        height: 1080,
      }
    };

  } catch (error) {
    console.error('🚨 Firecrawl error:', error);
    return {
      success: false,
      error: `Firecrawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}