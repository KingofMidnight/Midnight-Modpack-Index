import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test database connection
    await prisma.$connect();

    // Get counts for existing tables only
    const [platformCount, modpackCount] = await Promise.all([
      prisma.platform.count(),
      prisma.modpack.count()
    ]);

    // Get sample data
    const platforms = await prisma.platform.findMany();
    const recentModpacks = await prisma.modpack.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { platform: true }
    });

    return NextResponse.json({
      status: 'connected',
      counts: {
        platforms: platformCount,
        modpacks: modpackCount,
        mods: 0, // No longer exists in schema
        modpackMods: 0 // No longer exists in schema
      },
      data: {
        platforms,
        recentModpacks
      }
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error.message,
        details: 'Failed to connect to database'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
