'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [projectType, setProjectType] = useState('modpack');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (projectType) searchParams.set('type', projectType);
    
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modpacks..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="modpack">Modpacks</option>
            <option value="mod">Mods</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
