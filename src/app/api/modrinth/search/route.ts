import { NextRequest, NextResponse } from 'next/server';
import { modrinthService } from '@/services/modrinth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const projectType = searchParams.get('project_type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build facets for modpack filtering
    const facets: string[][] = [];
    if (projectType) {
      facets.push([`project_type:${projectType}`]);
    }

    const results = await modrinthService.searchProjects({
      query,
      facets: facets.length > 0 ? facets : undefined,
      limit,
      offset,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Modrinth search error:', error);
    return NextResponse.json(
      { error: 'Failed to search modpacks' },
      { status: 500 }
    );
  }
}
