"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdvancedSearchProps {
  onSearch: (params: SearchParams) => void;
}

interface SearchParams {
  query: string;
  platform: string;
  modLoader: string;
  minecraftVersion: string;
  sortBy: string;
}

const MINECRAFT_VERSIONS = [
  '1.21', '1.20.6', '1.20.5', '1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19', '1.18.2', '1.18.1', '1.18',
  '1.17.1', '1.17', '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16'
];

const MOD_LOADERS = [
  'Forge', 'Fabric', 'Quilt', 'NeoForge'
];

const PLATFORMS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'modrinth', label: 'Modrinth' },
  { value: 'curseforge', label: 'CurseForge' },
  { value: 'database', label: 'Local Database' }
];

const SORT_OPTIONS = [
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'follows', label: 'Most Followed' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Newest' }
];

export default function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    platform: 'all',
    modLoader: '',
    minecraftVersion: '',
    sortBy: 'downloads'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      query: '',
      platform: 'all',
      modLoader: '',
      minecraftVersion: '',
      sortBy: 'downloads'
    });
  };

  return (
    <div className="advanced-search">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Basic Search Row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchParams.query}
              onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Search modpacks..."
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="advanced-filters animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform
                </label>
                <select
                  value={searchParams.platform}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {PLATFORMS.map(platform => (
                    <option key={platform.value} value={platform.value} className="bg-slate-800">
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mod Loader Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mod Loader
                </label>
                <select
                  value={searchParams.modLoader}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, modLoader: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-slate-800">Any Loader</option>
                  {MOD_LOADERS.map(loader => (
                    <option key={loader} value={loader} className="bg-slate-800">
                      {loader}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minecraft Version Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minecraft Version
                </label>
                <select
                  value={searchParams.minecraftVersion}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, minecraftVersion: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-slate-800">Any Version</option>
                  {MINECRAFT_VERSIONS.map(version => (
                    <option key={version} value={version} className="bg-slate-800">
                      {version}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={searchParams.sortBy}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
              
              <div className="text-sm text-gray-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use filters to narrow down your search results
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
