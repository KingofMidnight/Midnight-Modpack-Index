"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
  categories: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [query, setQuery] = useState("");
  const [projectType, setProjectType] = useState("modpack");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "modpack";
    setQuery(q);
    setProjectType(type);
    
    if (q || type) {
      performSearch(q, type);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (type) params.set("project_type", type);
      params.set("limit", "20");
      
      const response = await fetch(`/api/modrinth/search?${params}`);
      const data = await response.json();
      
      setResults(data.hits || []);
      setTotalHits(data.total_hits || 0);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, projectType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-white">Midnight Modiverse</a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </a>
                <a href="/search" className="text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Search
                </a>
                <a href="/admin" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleNewSearch} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modpacks..."
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="modpack" className="bg-slate-800">Modpacks</option>
                <option value="mod" className="bg-slate-800">Mods</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Searching...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-gray-300 mb-6">
              Found {totalHits.toLocaleString()} results
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div key={result.project_id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all hover:scale-105">
                  <div className="flex items-start gap-4">
                    {result.icon_url && (
                      <img
                        src={result.icon_url}
                        alt={result.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                        {result.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.categories.slice(0, 3).map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>↓ {result.downloads.toLocaleString()}</span>
                        <span>★ {result.follows.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (query || projectType !== "modpack") && (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No results found. Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
