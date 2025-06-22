import { prisma } from '@/lib/prisma';
import { modrinthService } from './modrinth';

export class SyncService {
  async syncModrinthModpacks(limit = 100) {
    try {
      console.log('Starting Modrinth modpack sync...');
      
      // Ensure Modrinth platform exists
      const platform = await prisma.platform.upsert({
        where: { name: 'Modrinth' },
        update: {},
        create: {
          name: 'Modrinth',
          baseUrl: 'https://modrinth.com',
        },
      });

      // Search for modpacks
      const searchResult = await modrinthService.searchProjects({
        facets: [['project_type:modpack']],
        limit,
        index: 'downloads',
      });

      let syncedCount = 0;
      
      for (const project of searchResult.hits) {
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
            lastUpdated: new Date(project.date_modified),
            minecraftVersion: project.latest_version,
          },
          create: {
            platformId: platform.id,
            externalId: project.project_id,
            name: project.title,
            description: project.description,
            downloadCount: project.downloads,
            lastUpdated: new Date(project.date_modified),
            minecraftVersion: project.latest_version,
          },
        });
        
        syncedCount++;
      }

      console.log(`Synced ${syncedCount} modpacks from Modrinth`);
      return { success: true, count: syncedCount };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

export const syncService = new SyncService();
