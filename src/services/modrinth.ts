interface ModrinthSearchParams {
  query?: string;
  facets?: string[][];
  index?: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated';
  offset?: number;
  limit?: number;
}

interface ModrinthProject {
  project_id: string;
  slug: string;
  title: string;
  description: string;
  categories: string[];
  client_side: string;
  server_side: string;
  project_type: string;
  downloads: number;
  icon_url?: string;
  versions: string[];
  follows: number;
  date_created: string;
  date_modified: string;
  latest_version?: string;
  license: string;
}

class ModrinthService {
  private baseUrl = 'https://api.modrinth.com/v2';
  private userAgent = 'midnight-modpack-index/0.1.0 (github.com/KingofMidnight/Midnight-Modpack-Index)';

  async searchProjects(params: ModrinthSearchParams = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.set('query', params.query);
    if (params.facets) searchParams.set('facets', JSON.stringify(params.facets));
    if (params.index) searchParams.set('index', params.index);
    if (params.offset) searchParams.set('offset', params.offset.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
      headers: {
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Modrinth API error: ${response.status}`);
    }

    return response.json();
  }

  async getProject(projectId: string) {
    const response = await fetch(`${this.baseUrl}/project/${projectId}`, {
      headers: {
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Modrinth API error: ${response.status}`);
    }

    return response.json();
  }
}

export const modrinthService = new ModrinthService();
