"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';

interface PopularModpack {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  platform: {
    name: string;
  };
  minecraftVersion?: string;
  iconUrl?: string;
  author?: string;
  categories?: string[];
}

export default function PopularModpacks() {
  const [modpacks, setModpacks] = useState<PopularModpack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularModpacks();
  }, []);

  const fetchPopularModpacks = async () => {
    try {
      const response = await fetch('/api/modrinth/search?project_type=modpack&limit=12&index=downloads');
      const data = await response.json();
      
      const formattedModpacks = data.hits?.map((hit: any) => ({
        id: hit.project_id,
        name: hit.title,
        description: hit.description,
        downloadCount: hit.downloads,
        platform: { name: 'Modrinth' },
        minecraftVersion: hit.latest_version,
        iconUrl: hit.icon_url,
        author: hit.author,
        categories: hit.categories?.slice(0, 2) || []
      })) || [];
      
      setModpacks(formattedModpacks);
    } catch (error) {
      console.error('Failed to fetch popular modpacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ModpacksLoadingSkeleton />;
  }

  return (
    <div className="modpack-grid">
      {modpacks.map((modpack) => (
        <ModpackCard key={modpack.id} modpack={modpack} />
      ))}
    </div>
  );
}

function ModpackCard({ modpack }: { modpack: PopularModpack }) {
  return (
    <div className="modpack-card group">
      <div className="modpack-card-header">
        <div className="modpack-icon-container">
          {modpack.iconUrl ? (
            <Image
              src={modpack.iconUrl}
              alt={modpack.name}
              width={48}
              height={48}
              className="modpack-icon"
            />
          ) : (
            <div className="modpack-icon-placeholder">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="modpack-meta">
          <span className="modpack-platform">{modpack.platform.name}</span>
          {modpack.categories && modpack.categories.length > 0 && (
            <div className="modpack-categories">
              {modpack.categories.map((category) => (
                <span key={category} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modpack-content">
        <h3 className="modpack-title">
          {modpack.name}
        </h3>
        
        <p className="modpack-description">
          {modpack.description}
        </p>
        
        <div className="modpack-stats">
          <div className="stat-item">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: "2rem", height: "2rem" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{formatNumber(modpack.downloadCount)}</span>
          </div>
          
          {modpack.minecraftVersion && (
            <div className="stat-item">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"  style={{ width: "2rem", height: "2rem" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>MC {modpack.minecraftVersion}</span>
            </div>
          )}
        </div>
      </div>

      <div className="modpack-footer">
        <div className="modpack-author">
          {modpack.author && (
            <span className="author-name">by {modpack.author}</span>
          )}
        </div>
        
        <Link 
          href={`https://modrinth.com/modpack/${modpack.id}`}
          className="view-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          View
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function ModpacksLoadingSkeleton() {
  return (
    <div className="modpack-grid">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="modpack-card loading">
          <div className="modpack-card-header">
            <div className="skeleton-icon"></div>
            <div className="skeleton-meta"></div>
          </div>
          <div className="modpack-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-description"></div>
            <div className="skeleton-stats"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
