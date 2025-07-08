interface CurseForgeSearchParams {
  gameId?: number;
  classId?: number;
  categoryId?: number;
  searchFilter?: string;
  sortField?: number;
  sortOrder?: string;
  modLoaderType?: number;
  gameVersion?: string;
  index?: number;
  pageSize?: number;
}

interface CurseForgeModpack {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  summary: string;
  status: number;
  downloadCount: number;
  isFeatured: boolean;
  primaryCategoryId: number;
  categories: Array<{
    categoryId: number;
    name: string;
    url: string;
    iconUrl: string;
  }>;
  authors: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  logo: {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
  };
  screenshots: Array<{
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
  }>;
  mainFileId: number;
  latestFiles: Array<{
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes: Array<{
      value: string;
      algo: number;
    }>;
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    downloadUrl: string;
    gameVersions: string[];
    sortableGameVersions: Array<{
      gameVersionName: string;
      gameVersionPadded: string;
      gameVersion: string;
      gameVersionReleaseDate: string;
      gameVersionTypeId: number;
    }>;
    dependencies: Array<{
      modId: number;
      relationType: number;
    }>;
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    fileFingerprint: number;
    modules: Array<{
      name: string;
      fingerprint: number;
    }>;
  }>;
  latestFilesIndexes: Array<{
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    gameVersionTypeId: number;
    modLoader: number;
  }>;
  dateCreated: string;
  dateModified: string;
  dateReleased: string;
  allowModDistribution: boolean;
  gamePopularityRank: number;
  isAvailable: boolean;
  thumbsUpCount: number;
  rating: number;
}

class CurseForgeService {
  private baseUrl = 'https://api.curseforge.com/v1';
  private apiKey = process.env.CURSEFORGE_API_KEY;
  private userAgent = 'midnight-modpack-index/1.0.0';

  async searchModpacks(params: CurseForgeSearchParams = {}): Promise<{ data: CurseForgeModpack[]; pagination: any }> {
    if (!this.apiKey) {
      throw new Error('CurseForge API key not configured');
    }

    const searchParams = new URLSearchParams();
    
    // Default parameters for modpacks
    searchParams.set('gameId', (params.gameId || 432).toString()); // Minecraft
    searchParams.set('classId', (params.classId || 4471).toString()); // Modpacks
    
    if (params.categoryId) searchParams.set('categoryId', params.categoryId.toString());
    if (params.searchFilter) searchParams.set('searchFilter', params.searchFilter);
    if (params.sortField) searchParams.set('sortField', params.sortField.toString());
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.modLoaderType) searchParams.set('modLoaderType', params.modLoaderType.toString());
    if (params.gameVersion) searchParams.set('gameVersion', params.gameVersion);
    
    searchParams.set('index', (params.index || 0).toString());
    searchParams.set('pageSize', (params.pageSize || 20).toString());

    const response = await fetch(`${this.baseUrl}/mods/search?${searchParams}`, {
      headers: {
        'X-API-Key': this.apiKey,
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CurseForge API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getModpack(modpackId: number): Promise<{ data: CurseForgeModpack }> {
    if (!this.apiKey) {
      throw new Error('CurseForge API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/mods/${modpackId}`, {
      headers: {
        'X-API-Key': this.apiKey,
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CurseForge API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getFeaturedModpacks(gameId = 432): Promise<{ data: { featured: CurseForgeModpack[]; popular: CurseForgeModpack[]; recentlyUpdated: CurseForgeModpack[] } }> {
    if (!this.apiKey) {
      throw new Error('CurseForge API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/mods/featured`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        excludedModIds: [],
        gameVersionTypeId: null
      }),
    });

    if (!response.ok) {
      throw new Error(`CurseForge API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const curseforgeService = new CurseForgeService();
