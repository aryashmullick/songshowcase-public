import { NextRequest, NextResponse } from 'next/server';
import UserSession from '@/Models/UserSession';
import { apiError, hashToken, HttpError, privateResponse, readSession, spotifyConfig } from '@/app/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const config = spotifyConfig();
    if (request.headers.get('origin') !== config.origin) throw new HttpError(403, 'Invalid request origin');
    const token = request.cookies.get('session_id')?.value;
    if (token && await readSession(token)) await UserSession.deleteOne({ session_id: hashToken(token) });
    const response = NextResponse.redirect(new URL('/', config.origin), 303);
    response.cookies.set('session_id', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
    return privateResponse(response);
  } catch (error) { return apiError(error); }
}
