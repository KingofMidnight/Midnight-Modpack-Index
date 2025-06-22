import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { syncService } from '@/services/sync';

export async function POST() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncService.syncModrinthModpacks();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Sync failed', details: message },
      { status: 500 }
    );
  }
}
