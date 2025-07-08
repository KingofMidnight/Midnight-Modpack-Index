'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface FavoriteButtonProps {
  modpackId: string;
  modpackName: string;
  className?: string;
}

export default function FavoriteButton({ modpackId, modpackName, className = '' }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      checkFavoriteStatus();
    }
  }, [session, modpackId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();
      const favorite = data.favorites?.find((fav: any) => fav.id === modpackId);
      setIsFavorited(!!favorite);
      setFavoriteId(favorite?.favoriteId || null);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user) {
      // Redirect to sign in
      window.location.href = '/api/auth/signin';
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorited && favoriteId) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${favoriteId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setIsFavorited(false);
          setFavoriteId(null);
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modpackId })
        });
        
        const data = await response.json();
        if (response.ok) {
          setIsFavorited(true);
          setFavoriteId(data.favoriteId);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`favorite-button ${isFavorited ? 'favorited' : ''} ${className}`}
      title={isFavorited ? `Remove ${modpackName} from favorites` : `Add ${modpackName} to favorites`}
    >
      <svg 
        className={`w-5 h-5 transition-all duration-200 ${loading ? 'animate-pulse' : ''}`} 
        fill={isFavorited ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      {loading && <span className="sr-only">Loading...</span>}
    </button>
  );
}
