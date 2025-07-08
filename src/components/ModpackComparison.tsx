'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ModpackComparisonProps {
  modpackIds: string[];
  onClose: () => void;
}

interface ComparisonModpack {
  id: string;
  name: string;
  description: string;
  platform: string;
  downloadCount: number;
  minecraftVersion: string;
  modLoader: string;
  iconUrl?: string;
  mods?: string[];
  categories: string[];
  [key: string]: any; // Index signature for dynamic access
}

interface ComparisonField {
  key: keyof ComparisonModpack;
  label: string;
}

export default function ModpackComparison({ modpackIds, onClose }: ModpackComparisonProps) {
  const [modpacks, setModpacks] = useState<ComparisonModpack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModpacksForComparison();
  }, [modpackIds]);

  const fetchModpacksForComparison = async () => {
    try {
      const promises = modpackIds.map(id => 
        fetch(`/api/modpacks/${id}`).then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      setModpacks(results.filter(result => !result.error));
    } catch (error) {
      console.error('Failed to fetch modpacks for comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="comparison-modal">
        <div className="comparison-content">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading comparison...</p>
          </div>
        </div>
      </div>
    );
  }

  const comparisonFields: ComparisonField[] = [
    { key: 'platform', label: 'Platform' },
    { key: 'minecraftVersion', label: 'Minecraft Version' },
    { key: 'modLoader', label: 'Mod Loader' },
    { key: 'downloadCount', label: 'Downloads' },
    { key: 'categories', label: 'Categories' },
  ];

  const renderFieldValue = (modpack: ComparisonModpack, field: ComparisonField) => {
    const value = modpack[field.key];
    
    if (field.key === 'categories' && Array.isArray(value)) {
      return (
        <div className="categories-list">
          {value.map((category: string) => (
            <span key={category} className="category-tag">
              {category}
            </span>
          ))}
        </div>
      );
    }
    
    if (field.key === 'downloadCount' && typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value || 'N/A';
  };

  return (
    <div className="comparison-modal">
      <div className="comparison-content">
        <div className="comparison-header">
          <h2 className="text-2xl font-bold text-white">Modpack Comparison</h2>
          <button onClick={onClose} className="close-button">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="comparison-table">
          <div className="comparison-grid">
            {/* Header row with modpack names and icons */}
            <div className="comparison-row header-row">
              <div className="comparison-cell field-label"></div>
              {modpacks.map((modpack) => (
                <div key={modpack.id} className="comparison-cell modpack-header">
                  {modpack.iconUrl && (
                    <Image
                      src={modpack.iconUrl}
                      alt={modpack.name}
                      width={48}
                      height={48}
                      className="modpack-icon"
                    />
                  )}
                  <h3 className="modpack-name">{modpack.name}</h3>
                </div>
              ))}
            </div>

            {/* Comparison fields */}
            {comparisonFields.map((field) => (
              <div key={field.key} className="comparison-row">
                <div className="comparison-cell field-label">
                  {field.label}
                </div>
                {modpacks.map((modpack) => (
                  <div key={modpack.id} className="comparison-cell">
                    {renderFieldValue(modpack, field)}
                  </div>
                ))}
              </div>
            ))}

            {/* Descriptions */}
            <div className="comparison-row">
              <div className="comparison-cell field-label">Description</div>
              {modpacks.map((modpack) => (
                <div key={modpack.id} className="comparison-cell description-cell">
                  <p className="description-text">{modpack.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
