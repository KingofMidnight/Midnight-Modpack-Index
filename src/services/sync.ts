import { prisma } from '@/lib/prisma';
import { modrinthService } from './modrinth';
import { curseforgeService } from './curseforge';

export class SyncService {
  async syncModrinthModpacks(limit = 50) {
    console.log(`🚀 Starting Modrinth modpack sync (limit: ${limit})...`);
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');

      const platform = await prisma.platform.upsert({
        where: { name: 'Modrinth' },
        update: { 
          baseUrl: 'https://modrinth.com',
          updatedAt: new Date()
        },
        create: {
          name: 'Modrinth',
          baseUrl: 'https://modrinth.com',
        },
      });

      const searchResult = await modrinthService.searchProjects({
        facets: [['project_type:modpack']],
        limit,
        index: 'downloads',
      });

      if (!searchResult.hits || searchResult.hits.length === 0) {
        return { 
          success: false, 
          error: 'No modpacks found from Modrinth API',
          details: { searchResult }
        };
      }

      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const [index, project] of searchResult.hits.entries()) {
        try {
          console.log(`⏳ Processing ${index + 1}/${searchResult.hits.length}: ${project.title}`);

          await prisma.modpack.upsert({
            where: {
              platformId_externalId: {
                platformId: platform.id,
                externalId: project.project_id,
              },
            },
            update: {
              name: project.title,
              description: project.description,
              downloadCount: project.downloads,
              followCount: project.follows,
              lastUpdated: new Date(project.date_modified),
              minecraftVersion: project.game_versions?.[0] || project.latest_version,
              modLoader: project.loaders?.[0] || project.loader || null,
              version: project.versions?.[0] || null,
              iconUrl: project.icon_url,
              author: project.author,
              updatedAt: new Date()
            },
            create: {
              platformId: platform.id,
              externalId: project.project_id,
              name: project.title,
              description: project.description,
              downloadCount: project.downloads,
              followCount: project.follows,
              lastUpdated: new Date(project.date_modified),
              minecraftVersion: project.game_versions?.[0] || project.latest_version,
              modLoader: project.loaders?.[0] || project.loader || null,
              version: project.versions?.[0] || null,
              iconUrl: project.icon_url,
              author: project.author,
            },
          });

          syncedCount++;
          console.log(`✅ Synced: ${project.title}`);
        } catch (error) {
          errorCount++;
          const errorMsg = `Failed to sync ${project.title}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      const summary = {
        success: true,
        count: syncedCount,
        total: searchResult.hits.length,
        errors: errorCount,
        platform: platform.name,
        timestamp: new Date().toISOString()
      };

      console.log(`🎉 Sync completed! Synced ${syncedCount}/${searchResult.hits.length} modpacks`);
      
      if (errors.length > 0) {
        summary.errorDetails = errors;
      }

      return summary;

    } catch (error) {
      const errorMsg = `Sync failed: ${error.message}`;
      console.error('💥', errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        stack: error.stack
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  async syncCurseForgeModpacks(limit = 50) {
    console.log(`🚀 Starting CurseForge modpack sync (limit: ${limit})...`);
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');

      const platform = await prisma.platform.upsert({
        where: { name: 'CurseForge' },
        update: { 
          baseUrl: 'https://www.curseforge.com',
          updatedAt: new Date()
        },
        create: {
          name: 'CurseForge',
          baseUrl: 'https://www.curseforge.com',
        },
      });

      const searchResult = await curseforgeService.searchModpacks({
        pageSize: limit,
        sortField: 6, // Total downloads
        sortOrder: 'desc'
      });

      if (!searchResult.data || searchResult.data.length === 0) {
        return { 
          success: false, 
          error: 'No modpacks found from CurseForge API',
          details: { searchResult }
        };
      }

      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const [index, modpack] of searchResult.data.entries()) {
        try {
          console.log(`⏳ Processing ${index + 1}/${searchResult.data.length}: ${modpack.name}`);

          const latestFile = modpack.latestFiles?.[0];
          const author = modpack.authors?.[0]?.name;
          const minecraftVersion = latestFile?.gameVersions?.[0] || 
                                  modpack.latestFilesIndexes?.[0]?.gameVersion;

          await prisma.modpack.upsert({
            where: {
              platformId_externalId: {
                platformId: platform.id,
                externalId: modpack.id.toString(),
              },
            },
            update: {
              name: modpack.name,
              description: modpack.summary,
              downloadCount: modpack.downloadCount,
              followCount: modpack.thumbsUpCount,
              lastUpdated: new Date(modpack.dateModified),
              minecraftVersion: minecraftVersion,
              modLoader: this.getModLoaderFromCurseForge(modpack),
              version: latestFile?.displayName || null,
              iconUrl: modpack.logo?.thumbnailUrl || modpack.logo?.url,
              author: author,
              updatedAt: new Date()
            },
            create: {
              platformId: platform.id,
              externalId: modpack.id.toString(),
              name: modpack.name,
              description: modpack.summary,
              downloadCount: modpack.downloadCount,
              followCount: modpack.thumbsUpCount,
              lastUpdated: new Date(modpack.dateModified),
              minecraftVersion: minecraftVersion,
              modLoader: this.getModLoaderFromCurseForge(modpack),
              version: latestFile?.displayName || null,
              iconUrl: modpack.logo?.thumbnailUrl || modpack.logo?.url,
              author: author,
            },
          });

          syncedCount++;
          console.log(`✅ Synced: ${modpack.name}`);
        } catch (error) {
          errorCount++;
          const errorMsg = `Failed to sync ${modpack.name}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      const summary = {
        success: true,
        count: syncedCount,
        total: searchResult.data.length,
        errors: errorCount,
        platform: platform.name,
        timestamp: new Date().toISOString()
      };

      console.log(`🎉 CurseForge sync completed! Synced ${syncedCount}/${searchResult.data.length} modpacks`);
      
      if (errors.length > 0) {
        summary.errorDetails = errors;
      }

      return summary;

    } catch (error) {
      const errorMsg = `CurseForge sync failed: ${error.message}`;
      console.error('💥', errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        stack: error.stack
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  private getModLoaderFromCurseForge(modpack: any): string | null {
    // Extract mod loader from latest files or indexes
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

  async syncAllPlatforms() {
    console.log('🚀 Starting multi-platform sync...');
    
    const results = [];
    
    // Sync Modrinth
    try {
      const modrinthResult = await this.syncModrinthModpacks(50);
      results.push({ platform: 'Modrinth', ...modrinthResult });
    } catch (error) {
      results.push({ 
        platform: 'Modrinth', 
        success: false, 
        error: error.message 
      });
    }

    // Sync CurseForge
    try {
      const curseforgeResult = await this.syncCurseForgeModpacks(50);
      results.push({ platform: 'CurseForge', ...curseforgeResult });
    } catch (error) {
      results.push({ 
        platform: 'CurseForge', 
        success: false, 
        error: error.message 
      });
    }

    const successfulSyncs = results.filter(r => r.success).length;
    const totalSynced = results.reduce((acc, r) => acc + (r.count || 0), 0);

    return {
      success: successfulSyncs > 0,
      platforms: results.length,
      successfulPlatforms: successfulSyncs,
      totalSynced,
      results,
      timestamp: new Date().toISOString()
    };
  }

  async getStatus() {
    try {
      const [platformCount, modpackCount] = await Promise.all([
        prisma.platform.count(),
        prisma.modpack.count()
      ]);

      const platformStats = await prisma.platform.findMany({
        include: {
          _count: {
            select: { modpacks: true }
          }
        }
      });

      const lastSync = await prisma.modpack.findFirst({
        orderBy: { updatedAt: 'desc' },
        include: { platform: true }
      });

      return {
        platforms: platformCount,
        modpacks: modpackCount,
        platformBreakdown: platformStats.map(p => ({
          name: p.name,
          count: p._count.modpacks,
          lastUpdate: p.updatedAt
        })),
        lastSync: lastSync ? {
          modpack: lastSync.name,
          platform: lastSync.platform.name,
          updatedAt: lastSync.updatedAt
        } : null
      };
    } catch (error) {
      throw new Error(`Status check failed: ${error.message}`);
    }
  }
}

export const syncService = new SyncService();
