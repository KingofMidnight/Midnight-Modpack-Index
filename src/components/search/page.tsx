'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';

interface SearchResult {
  project_id: string;
  slug: string;
  title: string;
  description: string;
  downloads: number;
  follows: number;
  icon_url?: string;
  date_modified: string;
  latest_version?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);

  const query = searchParams.get('q') || '';
  const projectType = searchParams.get('type') || 'modpack';

  useEffect(() => {
    if (query || projectType) {
      performSearch();
    }
  }, [query, projectType]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (projectType) params.set('project_type', projectType);
      
      const response = await fetch(`/api/modrinth/search?${params}`);
      const data = await response.json();
      
      setResults(data.hits || []);
      setTotalHits(data.total_hits || 0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <SearchBar />
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-gray-600 mb-4">
              Found {totalHits.toLocaleString()} results
            </p>
            
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.project_id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {result.icon_url && (
                      <img
                        src={result.icon_url}
                        alt={result.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>↓ {result.downloads.toLocaleString()} downloads</span>
                        <span>★ {result.follows.toLocaleString()} follows</span>
                        {result.latest_version && (
                          <span>Latest: {result.latest_version}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (query || projectType !== 'modpack') && (
          <div className="text-center py-8">
            <p className="text-gray-600">No results found. Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
