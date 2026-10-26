import { NextRequest, NextResponse } from 'next/server';
import { apiError, cookieOptions, newToken, privateResponse, spotifyConfig, STATE_SECONDS } from '@/app/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    const config = spotifyConfig();
    const state = newToken();
    const url = new URL('https://accounts.spotify.com/authorize');
    url.search = new URLSearchParams({ response_type: 'code', client_id: config.clientId,
      scope: 'user-read-playback-state user-top-read playlist-read-private playlist-read-collaborative',
      redirect_uri: config.redirectUri, state }).toString();
    const response = NextResponse.redirect(url, 303);
    response.cookies.set('oauth_state', state, cookieOptions(STATE_SECONDS));
    return privateResponse(response);
  } catch (error) { return apiError(error); }
}
