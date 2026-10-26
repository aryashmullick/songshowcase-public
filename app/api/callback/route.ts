import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/connectDB';
import UserSession from '@/Models/UserSession';
import UserInfo from '@/Models/UserInfo';
import { apiError, cookieOptions, exchangeToken, hashToken, HttpError, newToken, parseJson, privateResponse,
  safeFetch, SESSION_SECONDS, spotifyConfig, validState } from '@/app/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  let response: NextResponse;
  try {
    const params = request.nextUrl.searchParams;
    if (!validState(params.get('state'), request.cookies.get('oauth_state')?.value)) throw new HttpError(400, 'Invalid or expired OAuth state');
    const code = params.get('code');
    if (params.has('error') || !code || code.length > 4096) throw new HttpError(400, 'Spotify authorization was not completed');
    const config = spotifyConfig();
    const tokens = await exchangeToken({ code, redirect_uri: config.redirectUri, grant_type: 'authorization_code' });
    if (!tokens.refresh_token) throw new HttpError(502, 'Spotify did not return a refresh token');
    const profileResponse = await safeFetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (!profileResponse.ok) throw new HttpError(502, 'Spotify profile could not be loaded');
    const profile = await parseJson(profileResponse);
    if (!profile || typeof profile.id !== 'string' || !profile.id) throw new HttpError(502, 'Spotify returned an invalid profile');
    const publicProfile = { id: profile.id, display_name: profile.display_name, images: profile.images, external_urls: profile.external_urls };
    await connectDB();
    await UserInfo.findOneAndUpdate({ sp_id: profile.id }, { $set: { sp_data: publicProfile } }, { upsert: true, runValidators: true }).exec();
    const session = newToken();
    await UserSession.create({ sp_id: profile.id, session_id: hashToken(session), sp_access_token: tokens.access_token,
      sp_refresh_token: tokens.refresh_token, access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      expires_at: new Date(Date.now() + SESSION_SECONDS * 1000) });
    response = NextResponse.redirect(new URL('/dash', config.origin), 303);
    response.cookies.set('session_id', session, cookieOptions(SESSION_SECONDS));
    response.cookies.set('sp_id', '', { path: '/', maxAge: 0 });
  } catch (error) { response = apiError(error); }
  response.cookies.set('oauth_state', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
  return privateResponse(response);
}
