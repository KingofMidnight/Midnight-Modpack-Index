"use client";

import { useState, useEffect } from "react";

interface PopularModpack {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  platform: {
    name: string;
  };
  minecraftVersion?: string;
}

export default function PopularModpacks() {
  const [modpacks, setModpacks] = useState<PopularModpack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularModpacks();
  }, []);

  const fetchPopularModpacks = async () => {
    try {
      const response = await fetch('/api/modrinth/search?project_type=modpack&limit=6&index=downloads');
      const data = await response.json();
      
      const formattedModpacks = data.hits?.map((hit: any) => ({
        id: hit.project_id,
        name: hit.title,
        description: hit.description,
        downloadCount: hit.downloads,
        platform: { name: 'Modrinth' },
        minecraftVersion: hit.latest_version
      })) || [];
      
      setModpacks(formattedModpacks);
    } catch (error) {
      console.error('Failed to fetch popular modpacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded mb-4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modpacks.map((modpack) => (
        <div key={modpack.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all hover:scale-105">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-white line-clamp-1">{modpack.name}</h3>
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
              {modpack.platform.name}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{modpack.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>↓ {modpack.downloadCount.toLocaleString()} downloads</span>
            {modpack.minecraftVersion && (
              <span>MC {modpack.minecraftVersion}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
