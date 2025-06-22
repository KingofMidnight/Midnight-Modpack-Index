'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg`}>
        <div className="p-4">
          <h2 className="text-xl font-bold">ModPack Admin</h2>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
              Dashboard
            </a>
            <a href="/admin/modpacks" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
              Modpacks
            </a>
            <a href="/admin/sync" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
              Sync Data
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="text-sm text-gray-600">
              Welcome, {session.user?.name}
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
