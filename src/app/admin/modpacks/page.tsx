'use client';

import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/admin/AdminLayout';

interface Modpack {
  id: string;
  name: string;
  description?: string;
  version?: string;
  minecraftVersion?: string;
  downloadCount?: number;
  platform: {
    name: string;
  };
  createdAt: string;
}

export default function ModpacksPage() {
  const [modpacks, setModpacks] = useState<Modpack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModpacks();
  }, []);

  const fetchModpacks = async () => {
    try {
      const response = await fetch('/api/admin/modpacks');
      const data = await response.json();
      setModpacks(data);
    } catch (error) {
      console.error('Failed to fetch modpacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading modpacks...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Modpacks</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Modpack
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MC Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modpacks.map((modpack) => (
                <tr key={modpack.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{modpack.name}</div>
                      <div className="text-sm text-gray-500">{modpack.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {modpack.platform.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {modpack.minecraftVersion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {modpack.downloadCount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
