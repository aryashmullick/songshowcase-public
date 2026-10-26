import { NextRequest, NextResponse } from 'next/server';
import { apiError, privateResponse, refreshSession, requireSession } from '@/app/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await refreshSession(session);
    return privateResponse(NextResponse.json({ message: 'ok' }));
  } catch (error) { return apiError(error); }
}
