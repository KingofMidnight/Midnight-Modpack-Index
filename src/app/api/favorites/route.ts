import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface FavoriteModpack {
  id: string;
  name: string;
  description: string | null;
  downloadCount: number | null;
  platform: string;
  iconUrl: string | null;
  favoriteId: string;
  favoritedAt: Date;
}

interface FavoriteResponse {
  favorites: FavoriteModpack[];
}

export async function GET(request: NextRequest): Promise<NextResponse<FavoriteResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        favorites: {
          include: {
            modpack: {
              include: { platform: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const favorites: FavoriteModpack[] = user?.favorites.map((fav: any) => ({
      id: fav.modpack.id,
      name: fav.modpack.name,
      description: fav.modpack.description,
      downloadCount: fav.modpack.downloadCount,
      platform: fav.modpack.platform.name,
      iconUrl: fav.modpack.iconUrl,
      favoriteId: fav.id,
      favoritedAt: fav.createdAt
    })) || [];

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<{ success: boolean; favoriteId?: string } | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { modpackId } = await request.json();
    
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      },
      update: {}
    });

    const favorite = await prisma.userFavorite.create({
      data: {
        userId: user.id,
        modpackId: modpackId
      }
    });

    return NextResponse.json({ success: true, favoriteId: favorite.id });
  } catch (error: any) {
    console.error('Failed to add favorite:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}
