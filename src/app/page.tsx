import Link from 'next/link';
import QuickSearch from "@/components/QuickSearch";
import PopularModpacks from "@/components/PopularModpacks";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Midnight Modiverse</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/search" className="text-white hover:text-purple-300 px-3 py-2 rounded-md text-sm font-medium">
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

      {/* Rest of your component remains the same */}
      <div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">Discover the Perfect</span>
            <span className="block text-purple-400">Minecraft Modpack</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Search through thousands of modpacks from Modrinth, CurseForge, and more. 
            Find the perfect pack for your playstyle with our advanced filtering system.
          </p>
          
          <div className="mt-10 max-w-2xl mx-auto">
            <QuickSearch />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Why Choose Midnight Modiverse?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Search</h3>
                <p className="text-gray-300">Find modpacks by included mods, Minecraft version, mod loader, and more.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Multi-Platform</h3>
                <p className="text-gray-300">Search across Modrinth, CurseForge, FTB, and Technic Platform.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">Built with modern web technologies for instant search results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Modpacks Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Popular Modpacks</h2>
            <p className="text-gray-300">Check out some of the most downloaded modpacks</p>
          </div>
          <PopularModpacks />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Midnight Modiverse. Built with ❤️ for the Minecraft community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
