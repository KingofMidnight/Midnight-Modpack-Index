import { Suspense } from "react";
import Link from 'next/link';
import SearchPageContent from "@/components/SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">Midnight Modiverse</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/search" className="text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Search
                </Link>
                <Link href="/admin" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading search page...</p>
        </div>
      </div>
    </div>
  );
}
