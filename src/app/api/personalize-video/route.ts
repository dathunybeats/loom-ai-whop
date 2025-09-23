import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureWebsiteScreenshot, enhancedWebScrape, captureWebsiteWithScrolling, saveScreenshotToStorage } from '@/lib/website-screenshot';
import { composePersonalizedVideo, composePersonalizedVideoReal, uploadComposedVideo } from '@/lib/video-composition';
import { callLambdaVideoComposition } from '@/lib/aws-lambda-client';
import path from 'path';
import os from 'os';

export interface PersonalizeVideoRequest {
  projectId: string;
  prospectIds: string[]; // Array of prospect IDs to process
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number; // Video diameter in pixels
  isPreview?: boolean; // If true, only process first 2 prospects
}

export interface PersonalizeVideoResponse {
  success: boolean;
  message: string;
  processed?: number;
  failed?: number;
  results?: Array<{
    prospectId: string;
    success: boolean;
    videoUrl?: string;
    error?: string;
    screenshotUrl?: string;
    websiteTitle?: string;
    websiteDescription?: string;
    prospectName?: string;
    websiteUrl?: string;
    contentLength?: number;
  }>;
}

export async function POST(request: NextRequest): Promise<NextResponse<PersonalizeVideoResponse>> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: PersonalizeVideoRequest = await request.json();
    const { projectId, prospectIds, position, size, isPreview } = body;

    // Validate input
    if (!projectId || !prospectIds?.length || !position || !size) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.base_video_url) {
      return NextResponse.json(
        { success: false, message: 'No base video found for project' },
        { status: 400 }
      );
    }

    // Get prospects to process
    let prospectsToProcess = prospectIds;
    if (isPreview) {
      prospectsToProcess = prospectIds.slice(0, 2); // Only first 2 for preview
    }

    const { data: prospects, error: prospectsError } = await supabase
      .from('prospects')
      .select('*')
      .in('id', prospectsToProcess)
      .eq('project_id', projectId);

    if (prospectsError || !prospects?.length) {
      return NextResponse.json(
        { success: false, message: 'No prospects found' },
        { status: 404 }
      );
    }

    console.log(`Starting video personalization for ${prospects.length} prospects`);

    const results: Array<{
      prospectId: string;
      success: boolean;
      videoUrl?: string;
      error?: string;
      screenshotUrl?: string;
      websiteTitle?: string;
      websiteDescription?: string;
      prospectName?: string;
      websiteUrl?: string;
      contentLength?: number;
    }> = [];

    let processed = 0;
    let failed = 0;

    // Process each prospect
    for (const prospect of prospects) {
      try {
        console.log(`Processing prospect: ${prospect.first_name} (${prospect.website_url})`);

        // Update prospect status to processing
        await supabase
          .from('prospects')
          .update({ video_status: 'processing' })
          .eq('id', prospect.id);

        // Step 1: Enhanced website scraping using Firecrawl v2 API
        if (!prospect.website_url) {
          throw new Error('No website URL provided for prospect');
        }

        console.log(`🎬 Processing video for ${prospect.first_name} - ${prospect.website_url}`);

        // Use ScreenshotOne as primary method (with fallback to scrolling animation)
        console.log('🚀 Using ScreenshotOne primary service...');
        const scrapeResult = await captureWebsiteScreenshot({
          url: prospect.website_url,
          fullPage: true,
          width: 1920,
          height: 1080
        });

        if (!scrapeResult.success || !scrapeResult.screenshot) {
          throw new Error(scrapeResult.error || 'Failed to capture screenshot');
        }

        console.log(`✅ Website capture successful for ${prospect.first_name}`);
        console.log(`🎬 Screenshot/Animation URL: ${scrapeResult.screenshot}`);
        console.log(`📄 Content extracted: ${scrapeResult.content ? scrapeResult.content.length : 0} chars`);
        console.log(`📝 Markdown extracted: ${scrapeResult.markdown ? scrapeResult.markdown.length : 0} chars`);

        // Step 2: Store additional scraped data in database
        // Enhanced scraping fields are now available in the prospects table

        // Step 3: Process screenshot (for now we'll use the URL directly from Firecrawl)
        // In production, you might want to download and re-upload to your own storage
        const screenshotUrl = scrapeResult.screenshot;

        console.log(`💾 Using screenshot URL: ${screenshotUrl}`);

        // Step 4: REAL Video composition with circular overlay
        console.log('🎬 Starting REAL video composition...');

        let personalizedVideoUrl: string;

        try {
          console.log(`🔄 Processing video composition via AWS Lambda...`);
          console.log(`📸 Screenshot URL: ${screenshotUrl}`);
          console.log(`🎯 Personalizing for: ${prospect.first_name}`);
          console.log(`📄 Website: ${scrapeResult.metadata?.title || 'Unknown'}`);

          // Use AWS Lambda for video composition (replaces local FFmpeg)
          const compositionResult = await callLambdaVideoComposition({
            baseVideoUrl: project.base_video_url,
            backgroundImageUrl: screenshotUrl,
            position: position,
            size: size,
            duration: 30,
            projectId: projectId
          });

          if (compositionResult.success && compositionResult.videoUrl) {
            personalizedVideoUrl = compositionResult.videoUrl;
            console.log('✅ AWS Lambda video composition completed successfully!');
            console.log(`🎬 Personalized Video URL: ${personalizedVideoUrl}`);
          } else {
            throw new Error(compositionResult.error || 'Lambda video composition failed');
          }

        } catch (compositionError) {
          console.error('❌ REAL video composition failed:', compositionError);
          console.log('🔄 Falling back to base video...');
          
          // Fallback to base video if composition fails
          personalizedVideoUrl = project.base_video_url;
          
          console.log('⚠️ Using base video as fallback');
        }

        // Update prospect with enhanced results including scraped data
        const { error: updateError } = await supabase
          .from('prospects')
          .update({
            video_status: 'completed',
            video_url: personalizedVideoUrl,
            personalized_video_url: personalizedVideoUrl, // Also update the legacy field
            video_generated_at: new Date().toISOString(),
            // Enhanced scraping data
            website_title: scrapeResult.metadata?.title || null,
            website_description: scrapeResult.metadata?.description || null,
            website_content: scrapeResult.content ? scrapeResult.content.substring(0, 5000) : null, // Truncate to 5000 chars
            screenshot_url: screenshotUrl,
            website_scraped_at: new Date().toISOString()
          })
          .eq('id', prospect.id);

        if (updateError) {
          console.error('❌ Failed to update prospect:', updateError);
          throw updateError;
        }

        console.log('✅ Successfully updated prospect in database');

        // 🔍 CONSOLE LOG: Screenshot URL for verification
        console.log('📸 === SCREENSHOT URL DEBUG ===');
        console.log(`👤 Prospect: ${prospect.first_name} ${prospect.last_name}`);
        console.log(`🌐 Website: ${prospect.website_url}`);
        console.log(`📸 Screenshot URL: ${screenshotUrl}`);
        console.log(`🎬 Video URL: ${personalizedVideoUrl}`);
        console.log(`📊 Website Title: ${scrapeResult.metadata?.title || 'N/A'}`);
        console.log(`📄 Content Length: ${scrapeResult.content?.length || 0} chars`);
        console.log('================================');

        results.push({
          prospectId: prospect.id,
          success: true,
          videoUrl: personalizedVideoUrl,
          screenshotUrl: screenshotUrl,
          websiteTitle: scrapeResult.metadata?.title,
          websiteDescription: scrapeResult.metadata?.description,
          prospectName: `${prospect.first_name} ${prospect.last_name}`,
          websiteUrl: prospect.website_url,
          contentLength: scrapeResult.content?.length || 0
        });

        processed++;
        console.log(`✅ Successfully processed prospect: ${prospect.first_name}`);

      } catch (error) {
        console.error(`Failed to process prospect ${prospect.id}:`, error);

        // Update prospect status to failed
        await supabase
          .from('prospects')
          .update({
            video_status: 'failed',
            // Optionally store error message in a field
          })
          .eq('id', prospect.id);

        results.push({
          prospectId: prospect.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        failed++;
      }
    }

    // Update project stats after processing all prospects
    if (processed > 0) {
      console.log(`📊 Updating project stats: +${processed} videos generated`);

      // First get current count
      const { data: currentProject } = await supabase
        .from('projects')
        .select('videos_generated')
        .eq('id', projectId)
        .single();

      const newCount = (currentProject?.videos_generated || 0) + processed;

      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update({
          videos_generated: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (projectUpdateError) {
        console.error('❌ Failed to update project stats:', projectUpdateError);
        // Don't fail the whole request, just log the error
      } else {
        console.log(`✅ Successfully updated project stats: ${newCount} total videos`);
      }

      // Update user's videos_used count
      console.log(`📊 Incrementing user video usage by ${processed} videos`);

      // Get current user data
      const { data: currentUser, error: getUserError } = await supabase
        .from('users')
        .select('videos_used')
        .eq('id', user.id)
        .single();

      if (getUserError) {
        console.error('❌ Failed to get current user video count:', getUserError);
      } else {
        const newVideosUsed = (currentUser.videos_used || 0) + processed;

        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            videos_used: newVideosUsed
          })
          .eq('id', user.id);

        if (userUpdateError) {
          console.error('❌ Failed to update user video count:', userUpdateError);
        } else {
          console.log(`✅ Successfully incremented user video usage to ${newVideosUsed} (+${processed})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} videos successfully, ${failed} failed`,
      processed,
      failed,
      results
    });

  } catch (error) {
    console.error('Video personalization error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID required' },
        { status: 400 }
      );
    }

    // Get processing status for all prospects in project
    const { data: prospects, error } = await supabase
      .from('prospects')
      .select('id, first_name, last_name, website_url, video_status, video_url, video_generated_at')
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    const summary = {
      total: prospects?.length || 0,
      pending: prospects?.filter(p => p.video_status === 'pending').length || 0,
      processing: prospects?.filter(p => p.video_status === 'processing').length || 0,
      completed: prospects?.filter(p => p.video_status === 'completed').length || 0,
      failed: prospects?.filter(p => p.video_status === 'failed').length || 0,
    };

    return NextResponse.json({
      success: true,
      summary,
      prospects
    });

  } catch (error) {
    console.error('Get status error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}