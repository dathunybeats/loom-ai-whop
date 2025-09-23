import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function parseCSV(csvText: string): Array<{ first_name: string; last_name?: string; email: string; website_url: string; company?: string; }> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const prospects = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}, skipping`);
      continue;
    }

    const prospect: any = {};
    headers.forEach((header, index) => {
      if (header.includes('first') && header.includes('name')) {
        prospect.first_name = values[index];
      } else if (header.includes('last') && header.includes('name')) {
        prospect.last_name = values[index];
      } else if (header.includes('email')) {
        prospect.email = values[index];
      } else if (header.includes('website') || header.includes('url')) {
        prospect.website_url = values[index];
      } else if (header.includes('company')) {
        prospect.company = values[index];
      }
    });

    // Validate required fields
    if (prospect.first_name && prospect.email) {
      prospects.push(prospect);
    } else {
      console.warn(`Row ${i + 1} missing required fields (first_name or email), skipping`);
    }
  }

  return prospects;
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

    const contentType = request.headers.get('content-type') || '';
    let projectId: string;
    let prospects: Array<{ first_name: string; last_name?: string; email: string; website_url: string; company?: string; }> = [];

    // Handle CSV file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      projectId = formData.get('projectId') as string;
      const csvFile = formData.get('csv') as File;

      if (!csvFile) {
        return NextResponse.json(
          { success: false, message: 'No CSV file provided' },
          { status: 400 }
        );
      }

      const csvText = await csvFile.text();
      prospects = parseCSV(csvText);
    }
    // Handle manual prospects (JSON)
    else {
      const body = await request.json();
      projectId = body.projectId;
      prospects = body.prospects || [];

      // Transform manual prospects to match expected format
      prospects = prospects.map(p => ({
        first_name: p.firstName || p.first_name,
        last_name: p.lastName || p.last_name,
        email: p.email,
        website_url: p.website || p.website_url,
        company: p.company
      })).filter(p => p.first_name && p.email); // Filter out invalid entries
    }

    // Validate input
    if (!projectId || !prospects.length) {
      return NextResponse.json(
        { success: false, message: 'Missing project ID or no valid prospects found' },
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
      website_url: prospect.website_url?.trim() || '',
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
    console.error('Upload prospects error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}