import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { modrinthService } from '@/services/modrinth';

interface SearchResult {
  project_id: string;
  title: string;
  description: string;
  downloads: number;
  follows: number;
  icon_url?: string;
  date_modified: string;
  latest_version?: string;
  author?: string;
  platform: string;
  mod_loader?: string;
  categories: string[];
}

interface SearchResponse {
  hits: SearchResult[];
  total_hits: number;
  offset: number;
  limit: number;
  cached?: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse | { error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const platform = searchParams.get('platform') || 'all';
    const modLoader = searchParams.get('modLoader');
    const minecraftVersion = searchParams.get('minecraftVersion');
    const sortBy = searchParams.get('sortBy') || 'downloads';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let searchResults: SearchResult[] = [];
    let totalHits = 0;

    if (platform === 'all' || platform === 'database') {
      // Search local database
      const whereClause: any = {};
      
      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } }
        ];
      }
      
      if (modLoader) {
        whereClause.modLoader = { equals: modLoader, mode: 'insensitive' };
      }
      
      if (minecraftVersion) {
        whereClause.minecraftVersion = { contains: minecraftVersion };
      }

      const orderBy: any = {};
      switch (sortBy) {
        case 'downloads':
          orderBy.downloadCount = 'desc';
          break;
        case 'follows':
          orderBy.followCount = 'desc';
          break;
        case 'updated':
          orderBy.lastUpdated = 'desc';
          break;
        case 'created':
          orderBy.createdAt = 'desc';
          break;
        default:
          orderBy.downloadCount = 'desc';
      }

      const [dbResults, dbCount] = await Promise.all([
        prisma.modpack.findMany({
          where: whereClause,
          include: { platform: true },
          orderBy,
          take: limit,
          skip: offset
        }),
        prisma.modpack.count({ where: whereClause })
      ]);

      searchResults = dbResults.map(modpack => ({
        project_id: modpack.externalId,
        title: modpack.name,
        description: modpack.description || '',
        downloads: modpack.downloadCount || 0,
        follows: modpack.followCount || 0,
        icon_url: modpack.iconUrl || undefined,
        date_modified: modpack.lastUpdated?.toISOString() || modpack.updatedAt.toISOString(),
        latest_version: modpack.minecraftVersion || undefined,
        author: modpack.author || undefined,
        platform: modpack.platform.name,
        mod_loader: modpack.modLoader || undefined,
        categories: []
      }));

      totalHits = dbCount;
    }

    // If searching all platforms, also fetch from APIs
    if (platform === 'all' || platform === 'modrinth') {
      try {
        const facets: string[][] = [['project_type:modpack']];
        
        if (modLoader) {
          facets.push([`categories:${modLoader.toLowerCase()}`]);
        }
        
        if (minecraftVersion) {
          facets.push([`versions:${minecraftVersion}`]);
        }

        const modrinthResults = await modrinthService.searchProjects({
          query,
          facets,
          limit: platform === 'modrinth' ? limit : Math.floor(limit / 2),
          offset,
          index: sortBy === 'updated' ? 'updated' : 'downloads'
        });

        const modrinthModpacks: SearchResult[] = modrinthResults.hits?.map((hit: any) => ({
          project_id: hit.project_id,
          title: hit.title,
          description: hit.description || '',
          downloads: hit.downloads || 0,
          follows: hit.follows || 0,
          icon_url: hit.icon_url,
          date_modified: hit.date_modified,
          latest_version: hit.latest_version,
          author: hit.author,
          platform: 'Modrinth',
          mod_loader: hit.loaders?.[0] || hit.loader,
          categories: hit.categories || []
        })) || [];

        if (platform === 'modrinth') {
          searchResults = modrinthModpacks;
          totalHits = modrinthResults.total_hits || 0;
        } else {
          searchResults = [...searchResults, ...modrinthModpacks];
          totalHits += modrinthResults.total_hits || 0;
        }
      } catch (error) {
        console.error('Modrinth search error:', error);
      }
    }

    // Sort combined results if needed
    if (platform === 'all' && searchResults.length > 0) {
      searchResults.sort((a, b) => {
        switch (sortBy) {
          case 'downloads':
            return (b.downloads || 0) - (a.downloads || 0);
          case 'follows':
            return (b.follows || 0) - (a.follows || 0);
          case 'updated':
            return new Date(b.date_modified).getTime() - new Date(a.date_modified).getTime();
          default:
            return (b.downloads || 0) - (a.downloads || 0);
        }
      });
    }

    const response: SearchResponse = {
      hits: searchResults.slice(0, limit),
      total_hits: totalHits,
      offset,
      limit
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
