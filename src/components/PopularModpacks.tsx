"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';

interface PopularModpack {
  id: string;
  name: string;
  description: string;
  downloadCount: number;
  followCount?: number;
  platform: {
    name: string;
  };
  minecraftVersion?: string;
  iconUrl?: string;
  author?: string;
  categories?: string[];
  modLoader?: string;
  lastUpdated?: string;
}

export default function PopularModpacks() {
  const [modpacks, setModpacks] = useState<PopularModpack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularModpacks();
  }, []);

  const fetchPopularModpacks = async () => {
    try {
      setError(null);
      const response = await fetch('/api/modrinth/search?project_type=modpack&limit=12&index=downloads');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const formattedModpacks = data.hits?.map((hit: any) => ({
        id: hit.project_id,
        name: hit.title,
        description: hit.description,
        downloadCount: hit.downloads,
        followCount: hit.follows,
        platform: { name: 'Modrinth' },
        minecraftVersion: hit.game_versions?.[0] || hit.latest_version,
        iconUrl: hit.icon_url,
        author: hit.author,
        categories: hit.categories?.slice(0, 3) || [],
        modLoader: hit.loaders?.[0] || hit.loader,
        lastUpdated: hit.date_modified
      })) || [];
      
      setModpacks(formattedModpacks);
    } catch (error) {
      console.error('Failed to fetch popular modpacks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch modpacks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ModpacksLoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPopularModpacks} />;
  }

  return (
    <div className="modpack-grid animate-fade-in">
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
        <div className="modpack-icon-wrapper">
          {modpack.iconUrl ? (
            <Image
              src={modpack.iconUrl}
              alt={modpack.name}
              width={56}
              height={56}
              className="modpack-icon"
              loading="lazy"
            />
          ) : (
            <div className="modpack-icon-placeholder">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="modpack-meta">
          <div className="platform-badge">
            {modpack.platform.name}
          </div>
          {modpack.modLoader && (
            <div className="loader-badge">
              {modpack.modLoader}
            </div>
          )}
        </div>
      </div>

      <div className="modpack-content">
        <h3 className="modpack-title">{modpack.name}</h3>
        
        {modpack.author && (
          <p className="modpack-author">by {modpack.author}</p>
        )}
        
        <p className="modpack-description">
          {modpack.description}
        </p>
        
        {modpack.categories && modpack.categories.length > 0 && (
          <div className="modpack-categories">
            {modpack.categories.map((category) => (
              <span key={category} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        )}
        
        <div className="modpack-stats">
          <div className="stat-item">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{formatNumber(modpack.downloadCount)} downloads</span>
          </div>
          
          {modpack.followCount && (
            <div className="stat-item">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{formatNumber(modpack.followCount)} follows</span>
            </div>
          )}
          
          {modpack.minecraftVersion && (
            <div className="stat-item">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>MC {modpack.minecraftVersion}</span>
            </div>
          )}
        </div>
      </div>

      <div className="modpack-footer">
        <div className="modpack-timestamp">
          {modpack.lastUpdated && (
            <span className="last-updated">
              Updated {formatTimeAgo(modpack.lastUpdated)}
            </span>
          )}
        </div>
        
        <Link 
          href={`https://modrinth.com/modpack/${modpack.id}`}
          className="view-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Modpack
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
        <div key={i} className="modpack-card loading-skeleton">
          <div className="modpack-card-header">
            <div className="skeleton-icon"></div>
            <div className="skeleton-meta"></div>
          </div>
          <div className="modpack-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-author"></div>
            <div className="skeleton-description"></div>
            <div className="skeleton-categories"></div>
            <div className="skeleton-stats"></div>
          </div>
          <div className="modpack-footer">
            <div className="skeleton-timestamp"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="error-title">Failed to load modpacks</h3>
      <p className="error-message">{error}</p>
      <button onClick={onRetry} className="retry-button">
        Try Again
      </button>
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
  return num.toLocaleString();
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
