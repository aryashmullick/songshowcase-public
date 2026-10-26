import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/connectDB';
import UserSession from '@/Models/UserSession';

export const SESSION_SECONDS = 7 * 24 * 60 * 60;
export const STATE_SECONDS = 10 * 60;
export const newToken = () => randomBytes(32).toString('hex');
export const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');

export class HttpError extends Error {
  constructor(public status: number, message: string, public retryAfter?: string) { super(message); }
}

export function spotifyConfig() {
  const clientId = process.env.SP_CLIENT_ID;
  const clientSecret = process.env.SP_CLIENT_SECRET;
  const callback = process.env.SP_REDIRECT_URI;
  if (!clientId || !clientSecret || !callback) throw new HttpError(500, 'Server configuration is incomplete');
  let redirect: URL;
  try { redirect = new URL(callback); } catch { throw new HttpError(500, 'Invalid callback configuration'); }
  const loopback = ['127.0.0.1', '[::1]'].includes(redirect.hostname);
  if ((redirect.protocol !== 'https:' && !(redirect.protocol === 'http:' && loopback)) ||
      redirect.pathname !== '/api/callback' || redirect.search || redirect.hash || redirect.username || redirect.password) {
    throw new HttpError(500, 'Invalid callback configuration');
  }
  return { clientId, clientSecret, redirectUri: redirect.href, origin: redirect.origin, secure: redirect.protocol === 'https:' };
}

export function privateResponse(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export function apiError(error: unknown) {
  const known = error instanceof HttpError;
  const response = NextResponse.json({ error: known ? error.message : 'Request could not be completed' }, { status: known ? error.status : 500 });
  if (known && error.retryAfter) response.headers.set('Retry-After', error.retryAfter);
  if (known && error.status === 401) response.cookies.set('session_id', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
  return privateResponse(response);
}

export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: spotifyConfig().secure, sameSite: 'lax' as const, path: '/', maxAge };
}

export function validState(received: string | null, expected?: string) {
  return !!received && !!expected && /^[a-f0-9]{64}$/.test(received) && /^[a-f0-9]{64}$/.test(expected) &&
    timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export async function readSession(token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await connectDB();
  const session = await UserSession.findOne({ session_id: hashToken(token) }).exec();
  if (!session || !session.expires_at || !Number.isFinite(new Date(session.expires_at).getTime()) || new Date(session.expires_at).getTime() <= Date.now()) return null;
  return session;
}

export async function requireSession(request: NextRequest) {
  const session = await readSession(request.cookies.get('session_id')?.value);
  if (!session) throw new HttpError(401, 'Please log in with Spotify');
  return session;
}

export async function safeFetch(url: string, options: RequestInit = {}) {
  try { return await fetch(url, { ...options, cache: 'no-store', signal: AbortSignal.timeout(10_000) }); }
  catch { throw new HttpError(502, 'Spotify could not be reached'); }
}

export async function parseJson(response: Response) {
  try { return await response.json(); } catch { throw new HttpError(502, 'Spotify returned an invalid response'); }
}

function upstreamError(response: Response) {
  if (response.status === 429) {
    const delay = response.headers.get('Retry-After') || '';
    return new HttpError(429, 'Spotify rate limit reached; try again later', /^\d{1,6}$/.test(delay) ? delay : '5');
  }
  if (response.status === 403) return new HttpError(403, 'Spotify does not allow this resource for this account or application');
  if (response.status === 401) return new HttpError(401, 'Please log in with Spotify again');
  return new HttpError(502, 'Spotify request failed');
}

export async function exchangeToken(parameters: Record<string, string>, refreshing = false) {
  const { clientId, clientSecret } = spotifyConfig();
  const response = await safeFetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
    body: new URLSearchParams(parameters),
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) throw new HttpError(refreshing ? 401 : 400, refreshing ? 'Please log in with Spotify again' : 'Spotify authorization was rejected');
    throw upstreamError(response);
  }
  const data = await parseJson(response);
  if (!data || typeof data.access_token !== 'string' || !data.access_token ||
      typeof data.expires_in !== 'number' || data.expires_in <= 0 || data.expires_in > 86400 ||
      (data.refresh_token !== undefined && (typeof data.refresh_token !== 'string' || !data.refresh_token))) {
    throw new HttpError(502, 'Spotify returned an invalid token response');
  }
  return data as { access_token: string; refresh_token?: string; expires_in: number };
}

// Coalesce refreshes within this Node process. Separate instances do not share this lock.
const refreshes = new Map<string, Promise<string>>();
export async function refreshSession(session: any): Promise<string> {
  const pending = refreshes.get(session.session_id);
  if (pending) return pending;
  const promise = (async () => {
    try {
      if (!session.sp_refresh_token) throw new HttpError(401, 'Please log in with Spotify again');
      const tokens = await exchangeToken({ grant_type: 'refresh_token', refresh_token: session.sp_refresh_token }, true);
      await UserSession.findOneAndUpdate({ session_id: session.session_id }, { $set: {
        sp_access_token: tokens.access_token,
        sp_refresh_token: tokens.refresh_token ?? session.sp_refresh_token,
        access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      } }).exec();
      session.sp_access_token = tokens.access_token;
      session.sp_refresh_token = tokens.refresh_token ?? session.sp_refresh_token;
      session.access_token_expires_at = new Date(Date.now() + tokens.expires_in * 1000);
      return tokens.access_token;
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) await UserSession.deleteOne({ session_id: session.session_id });
      throw error;
    }
  })();
  refreshes.set(session.session_id, promise);
  try { return await promise; } finally { refreshes.delete(session.session_id); }
}

export async function spotifyRequest(session: any, path: string) {
  let token = session.sp_access_token;
  if (!session.access_token_expires_at || new Date(session.access_token_expires_at).getTime() <= Date.now() + 30_000) token = await refreshSession(session);
  const fetchResource = () => safeFetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${token}` } });
  let response = await fetchResource();
  if (response.status === 401) { token = await refreshSession(session); response = await fetchResource(); }
  if (!response.ok) throw upstreamError(response);
  if (response.status === 204) return null;
  return parseJson(response);
}
