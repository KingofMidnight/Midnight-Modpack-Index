import { prisma } from '@/lib/prisma';
import { modrinthService } from './modrinth';

export class SyncService {
  async syncModrinthModpacks(limit = 50) {
    console.log(`🚀 Starting Modrinth modpack sync (limit: ${limit})...`);
    
    try {
      // Test database connection first
      await prisma.$connect();
      console.log('✅ Database connection successful');

      // Ensure Modrinth platform exists
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
      console.log(`✅ Platform ensured: ${platform.name} (ID: ${platform.id})`);

      // Search for modpacks from Modrinth
      console.log('🔍 Searching for modpacks...');
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

      console.log(`📦 Found ${searchResult.hits.length} modpacks to sync`);

      let syncedCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each modpack
      for (const [index, project] of searchResult.hits.entries()) {
        try {
          console.log(`⏳ Processing ${index + 1}/${searchResult.hits.length}: ${project.title}`);

          const modpack = await prisma.modpack.upsert({
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
              lastUpdated: new Date(project.date_modified),
              minecraftVersion: project.latest_version,
              modLoader: project.loader || null,
              version: project.versions?.[0] || null,
              updatedAt: new Date()
            },
            create: {
              platformId: platform.id,
              externalId: project.project_id,
              name: project.title,
              description: project.description,
              downloadCount: project.downloads,
              lastUpdated: new Date(project.date_modified),
              minecraftVersion: project.latest_version,
              modLoader: project.loader || null,
              version: project.versions?.[0] || null,
            },
          });

          syncedCount++;
          console.log(`✅ Synced: ${modpack.name}`);
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

  async getStatus() {
    try {
      const [platformCount, modpackCount] = await Promise.all([
        prisma.platform.count(),
        prisma.modpack.count()
      ]);

      const lastSync = await prisma.modpack.findFirst({
        orderBy: { updatedAt: 'desc' },
        include: { platform: true }
      });

      return {
        platforms: platformCount,
        modpacks: modpackCount,
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
