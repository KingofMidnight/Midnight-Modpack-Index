'use client';

import { useState, useEffect } from 'react';

interface DatabaseStatus {
  status: string;
  counts: {
    platforms: number;
    modpacks: number;
  };
  data: {
    platforms: any[];
    recentModpacks: any[];
  };
}

interface SyncResult {
  success: boolean;
  count?: number;
  total?: number;
  errors?: number;
  error?: string;
}

export default function AdminDashboard() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/admin/db-status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Failed to fetch database status:', error);
      setDbStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
      });
      const result = await response.json();
      setSyncResult(result);
      
      if (result.success) {
        setTimeout(fetchDatabaseStatus, 1000);
      }
    } catch (error) {
      setSyncResult({
        success: false,
        error: `Sync request failed: ${error.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage your modpack database</p>
        </div>

        {/* Database Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Database Status</h2>
          
          {dbStatus?.status === 'connected' ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{dbStatus.counts.platforms}</div>
                <div className="text-sm text-gray-300">Platforms</div>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{dbStatus.counts.modpacks}</div>
                <div className="text-sm text-gray-300">Modpacks</div>
              </div>
            </div>
          ) : (
            <div className="text-red-400 mb-6">
              Failed to connect to database. Check your configuration.
            </div>
          )}

          {/* Recent Modpacks */}
          {dbStatus?.data.recentModpacks && dbStatus.data.recentModpacks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Recent Modpacks</h3>
              <div className="space-y-2">
                {dbStatus.data.recentModpacks.map((modpack) => (
                  <div key={modpack.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">{modpack.name}</div>
                        <div className="text-sm text-gray-400">
                          {modpack.platform.name} • {modpack.downloadCount?.toLocaleString()} downloads
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(modpack.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sync Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Data Synchronization</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Syncing...
                </>
              ) : (
                'Sync Modrinth Data'
              )}
            </button>
            
            <button
              onClick={fetchDatabaseStatus}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Refresh Status
            </button>
          </div>

          {/* Sync Results */}
          {syncResult && (
            <div className={`rounded-lg p-4 ${syncResult.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <h3 className={`font-medium ${syncResult.success ? 'text-green-300' : 'text-red-300'}`}>
                {syncResult.success ? 'Sync Successful!' : 'Sync Failed'}
              </h3>
              
              {syncResult.success ? (
                <div className="text-sm text-white mt-2">
                  <p>Synced {syncResult.count} out of {syncResult.total} modpacks</p>
                </div>
              ) : (
                <div className="text-sm text-red-200 mt-2">
                  <p>{syncResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
