import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface BulkProspectRequest {
  projectId: string;
  prospects: Array<{
    first_name: string;
    last_name?: string;
    email: string;
    website_url: string;
    company?: string;
  }>;
}

export async function POST(request: NextRequest) {
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

    const body: BulkProspectRequest = await request.json();
    const { projectId, prospects } = body;

    // Validate input
    if (!projectId || !prospects?.length) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Prepare prospects data for insertion
    const prospectsToInsert = prospects.map(prospect => ({
      project_id: projectId,
      user_id: user.id,
      first_name: prospect.first_name.trim(),
      last_name: prospect.last_name?.trim() || null,
      email: prospect.email.trim().toLowerCase(),
      website_url: prospect.website_url.trim(),
      company: prospect.company?.trim() || null,
      video_status: 'pending' as const,
      custom_fields: {},
    }));

    // Insert prospects in batch
    const { data: insertedProspects, error: insertError } = await supabase
      .from('prospects')
      .insert(prospectsToInsert)
      .select('id, first_name, email, website_url');

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        {
          success: false,
          message: insertError.message.includes('duplicate')
            ? 'Some prospects already exist in this project'
            : 'Failed to insert prospects'
        },
        { status: 400 }
      );
    }

    // Update project prospects count
    await supabase.rpc('increment_project_prospects_count', {
      project_id: projectId,
      count_increment: insertedProspects.length
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedProspects.length} prospects`,
      count: insertedProspects.length,
      prospects: insertedProspects
    });

  } catch (error) {
    console.error('Bulk prospects creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const prospectIds = searchParams.get('ids')?.split(',') || [];

    if (!prospectIds.length) {
      return NextResponse.json(
        { success: false, message: 'No prospect IDs provided' },
        { status: 400 }
      );
    }

    // Delete prospects (with RLS ensuring user can only delete their own)
    const { error: deleteError } = await supabase
      .from('prospects')
      .delete()
      .in('id', prospectIds)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete prospects' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${prospectIds.length} prospects`
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}