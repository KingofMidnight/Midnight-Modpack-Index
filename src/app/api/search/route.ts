import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { modrinthService } from '@/services/modrinth';
import { curseforgeService } from '@/services/curseforge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const platform = searchParams.get('platform') || 'all';
    const modLoader = searchParams.get('modLoader');
    const minecraftVersion = searchParams.get('minecraftVersion');
    const sortBy = searchParams.get('sortBy') || 'downloads';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let results = [];
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

      results = dbResults.map(modpack => ({
        project_id: modpack.externalId,
        title: modpack.name,
        description: modpack.description,
        downloads: modpack.downloadCount || 0,
        follows: modpack.followCount || 0,
        icon_url: modpack.iconUrl,
        date_modified: modpack.lastUpdated?.toISOString() || modpack.updatedAt.toISOString(),
        latest_version: modpack.minecraftVersion,
        author: modpack.author,
        platform: modpack.platform.name,
        mod_loader: modpack.modLoader,
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

        const modrinthModpacks = modrinthResults.hits?.map((hit: any) => ({
          ...hit,
          platform: 'Modrinth',
          mod_loader: hit.loaders?.[0] || hit.loader
        })) || [];

        if (platform === 'modrinth') {
          results = modrinthModpacks;
          totalHits = modrinthResults.total_hits || 0;
        } else {
          results = [...results, ...modrinthModpacks];
          totalHits += modrinthResults.total_hits || 0;
        }
      } catch (error) {
        console.error('Modrinth search error:', error);
      }
    }

    if (platform === 'all' || platform === 'curseforge') {
      try {
        const sortField = sortBy === 'updated' ? 2 : 6; // 2 = LastUpdated, 6 = TotalDownloads
        
        const curseforgeResults = await curseforgeService.searchModpacks({
          searchFilter: query,
          gameVersion: minecraftVersion,
          sortField,
          sortOrder: 'desc',
          pageSize: platform === 'curseforge' ? limit : Math.floor(limit / 2),
          index: offset
        });

        const curseforgeModpacks = curseforgeResults.data?.map((modpack: any) => ({
          project_id: modpack.id.toString(),
          title: modpack.name,
          description: modpack.summary,
          downloads: modpack.downloadCount || 0,
          follows: modpack.thumbsUpCount || 0,
          icon_url: modpack.logo?.thumbnailUrl || modpack.logo?.url,
          date_modified: modpack.dateModified,
          latest_version: modpack.latestFiles?.[0]?.gameVersions?.[0],
          author: modpack.authors?.[0]?.name,
          platform: 'CurseForge',
          mod_loader: this.getModLoaderFromCurseForge(modpack),
          categories: modpack.categories?.map((cat: any) => cat.name) || []
        })) || [];

        if (platform === 'curseforge') {
          results = curseforgeModpacks;
          totalHits = curseforgeResults.pagination?.totalCount || 0;
        } else {
          results = [...results, ...curseforgeModpacks];
          totalHits += curseforgeResults.pagination?.totalCount || 0;
        }
      } catch (error) {
        console.error('CurseForge search error:', error);
      }
    }

    // Sort combined results if needed
    if (platform === 'all' && results.length > 0) {
      results.sort((a, b) => {
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

    return NextResponse.json({
      hits: results.slice(0, limit),
      total_hits: totalHits,
      offset,
      limit
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}

function getModLoaderFromCurseForge(modpack: any): string | null {
  const latestFileIndex = modpack.latestFilesIndexes?.[0];
  if (latestFileIndex?.modLoader) {
    const loaderMap = {
      1: 'Forge',
      4: 'Fabric',
      5: 'Quilt',
      6: 'NeoForge'
    };
    return loaderMap[latestFileIndex.modLoader] || null;
  }
  return null;
}
