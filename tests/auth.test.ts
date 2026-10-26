import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const db = vi.hoisted(() => ({
  connect: vi.fn(), findOne: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), profile: vi.fn(),
}));
vi.mock('@/app/lib/connectDB', () => ({ default: db.connect }));
vi.mock('@/Models/UserSession', () => ({ default: {
  findOne: db.findOne, create: db.create, findOneAndUpdate: db.update, deleteOne: db.remove,
} }));
vi.mock('@/Models/UserInfo', () => ({ default: { findOneAndUpdate: db.profile } }));

import { GET as login } from '@/app/api/login/route';
import { GET as callback } from '@/app/api/callback/route';
import { GET as get } from '@/app/api/get/route';
import { GET as refresh } from '@/app/api/refresh/route';
import { POST as logout } from '@/app/api/logout/route';

const state = 'a'.repeat(64);
const sessionToken = 'b'.repeat(64);
const request = (path: string, cookie = '', method = 'GET', origin?: string) => new NextRequest(`http://127.0.0.1:3000${path}`, {
  method, headers: { ...(cookie ? { cookie } : {}), ...(origin ? { origin } : {}) },
});
const session = () => ({ session_id: 'stored-hash', sp_id: 'fixture-user', sp_access_token: 'fixture-access', sp_refresh_token: 'fixture-refresh',
  access_token_expires_at: new Date(Date.now() + 3600_000), expires_at: new Date(Date.now() + 86400_000) });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetAllMocks();
  process.env.SP_CLIENT_ID = 'fixture-client';
  process.env.SP_CLIENT_SECRET = 'fixture-secret';
  process.env.SP_REDIRECT_URI = 'http://127.0.0.1:3000/api/callback';
  db.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(session()) });
  db.update.mockReturnValue({ exec: vi.fn().mockResolvedValue(session()) });
  db.profile.mockReturnValue({ exec: vi.fn().mockResolvedValue({}) });
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('OAuth boundary', () => {
  it('binds a cryptographically random state to an HttpOnly cookie and configured redirect', async () => {
    const a = await login(request('/api/login'));
    const b = await login(request('/api/login'));
    const url = new URL(a.headers.get('location')!);
    expect(url.origin).toBe('https://accounts.spotify.com');
    expect(url.searchParams.get('state')).toMatch(/^[a-f0-9]{64}$/);
    expect(url.searchParams.get('state')).not.toBe(new URL(b.headers.get('location')!).searchParams.get('state'));
    expect(a.cookies.get('oauth_state')?.value).toBe(url.searchParams.get('state'));
    expect(a.headers.get('set-cookie')).toMatch(/HttpOnly/);
    expect(a.headers.get('set-cookie')).toMatch(/SameSite=lax/i);
    expect(url.searchParams.get('redirect_uri')).toBe(process.env.SP_REDIRECT_URI);
    expect(a.headers.get('cache-control')).toContain('no-store');
  });
  it.each([
    ['/api/callback?code=fixture', ''],
    [`/api/callback?code=fixture&state=${state}`, ''],
    [`/api/callback?code=fixture&state=${'c'.repeat(64)}`, `oauth_state=${state}`],
    [`/api/callback?state=${state}`, `oauth_state=${state}`],
    [`/api/callback?error=access_denied&state=${state}`, `oauth_state=${state}`],
  ])('rejects missing, mismatched or denied callbacks before upstream/database access: %s', async (path, cookie) => {
    const result = await callback(request(path, cookie));
    expect(result.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.connect).not.toHaveBeenCalled();
    expect(result.cookies.get('oauth_state')?.value).toBe('');
  });
  it('stores tokens server-side and returns only an opaque secured session cookie', async () => {
    fetchMock.mockResolvedValueOnce(json({ access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600 }))
      .mockResolvedValueOnce(json({ id: 'fixture-user', display_name: 'Demo listener', email: 'exclude@example.test', images: [] }));
    const result = await callback(request(`/api/callback?code=fixture&state=${state}`, `oauth_state=${state}`));
    expect(result.status).toBe(303);
    expect(result.headers.get('location')).toBe('http://127.0.0.1:3000/dash');
    const value = result.cookies.get('session_id')!.value;
    expect(value).toMatch(/^[a-f0-9]{64}$/);
    expect(db.create.mock.calls[0][0].session_id).not.toBe(value);
    expect(db.create.mock.calls[0][0].sp_access_token).toBe('fixture-access');
    expect(JSON.stringify(db.profile.mock.calls)).not.toContain('exclude@example.test');
    expect(result.headers.get('set-cookie')).toMatch(/HttpOnly/);
    expect(result.headers.get('set-cookie')).not.toContain('fixture-access');
    expect(result.cookies.get('sp_id')?.value).toBe('');
    expect(result.cookies.get('sp_id')?.maxAge).toBe(0);
  });
  it('sets Secure cookies on an HTTPS deployment', async () => {
    process.env.SP_REDIRECT_URI = 'https://demo.example.test/api/callback';
    expect((await login(request('/api/login'))).headers.get('set-cookie')).toContain('Secure');
  });
  it.each(['http://localhost:3000/api/callback', 'http://demo.example.test/api/callback', 'https://demo.example.test/wrong', 'https://demo.example.test/api/callback?extra=1'])('rejects invalid callback configuration: %s', async callbackUrl => {
    process.env.SP_REDIRECT_URI = callbackUrl;
    expect((await login(request('/api/login'))).status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('fails closed on missing configuration', async () => {
    delete process.env.SP_CLIENT_SECRET;
    expect((await login(request('/api/login'))).status).toBe(500);
  });
  it('does not expose Spotify error bodies or write a session on a rejected exchange', async () => {
    fetchMock.mockResolvedValue(json({ error: 'invalid_grant', error_description: 'fixture-private-detail' }, 400));
    const result = await callback(request(`/api/callback?code=fixture&state=${state}`, `oauth_state=${state}`));
    expect(result.status).toBe(400);
    expect(await result.text()).not.toContain('fixture-private-detail');
    expect(db.create).not.toHaveBeenCalled();
  });
});

describe('protected API and refresh', () => {
  it.each([get, refresh])('rejects absent cookies without connecting to MongoDB', async handler => {
    expect((await handler(request('/api/get?get=info'))).status).toBe(401);
    expect(db.connect).not.toHaveBeenCalled();
  });
  it.each([null, { ...session(), expires_at: new Date(0) }, { ...session(), expires_at: 'invalid' }])('rejects an unknown or expired session', async value => {
    db.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(value) });
    expect((await get(request('/api/get?get=info', `session_id=${sessionToken}`))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('never uses a browser-supplied Spotify identity to select tokens', async () => {
    fetchMock.mockResolvedValue(json({ id: 'fixture-user' }));
    const result = await get(request('/api/get?get=info', `session_id=${sessionToken}; sp_id=another-user`));
    expect(result.status).toBe(200);
    expect(db.findOne.mock.calls[0][0]).not.toHaveProperty('sp_id');
    expect(db.findOne.mock.calls[0][0].session_id).not.toBe(sessionToken);
    expect(result.headers.get('cache-control')).toContain('no-store');
  });
  it('preserves the old refresh token when Spotify omits a replacement', async () => {
    db.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ ...session(), access_token_expires_at: new Date(0) }) });
    fetchMock.mockResolvedValueOnce(json({ access_token: 'fixture-new-access', expires_in: 3600 }))
      .mockResolvedValueOnce(json({ id: 'fixture-user' }));
    const result = await get(request('/api/get?get=info', `session_id=${sessionToken}`));
    expect(result.status).toBe(200);
    expect(db.update.mock.calls[0][1].$set.sp_refresh_token).toBe('fixture-refresh');
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer fixture-new-access');
  });
  it('persists a rotated refresh token', async () => {
    fetchMock.mockResolvedValue(json({ access_token: 'fixture-new-access', refresh_token: 'fixture-rotated', expires_in: 3600 }));
    expect((await refresh(request('/api/refresh', `session_id=${sessionToken}`))).status).toBe(200);
    expect(db.update.mock.calls[0][1].$set.sp_refresh_token).toBe('fixture-rotated');
  });
  it('does not overwrite tokens after a malformed refresh response', async () => {
    fetchMock.mockResolvedValue(json({ access_token: 'fixture-access' }));
    expect((await refresh(request('/api/refresh', `session_id=${sessionToken}`))).status).toBe(502);
    expect(db.update).not.toHaveBeenCalled();
  });
  it('returns 401 and removes the local session when refresh is revoked', async () => {
    fetchMock.mockResolvedValue(json({ error: 'invalid_grant' }, 400));
    expect((await refresh(request('/api/refresh', `session_id=${sessionToken}`))).status).toBe(401);
    expect(db.remove).toHaveBeenCalled();
  });
  it('retries a Spotify 401 once after refresh', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({ access_token: 'fixture-new-access', expires_in: 3600 }))
      .mockResolvedValueOnce(json({ id: 'fixture-user' }));
    expect((await get(request('/api/get?get=info', `session_id=${sessionToken}`))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it('stops after a repeated Spotify 401', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({ access_token: 'fixture-new-access', expires_in: 3600 }))
      .mockResolvedValueOnce(json({}, 401));
    expect((await get(request('/api/get?get=info', `session_id=${sessionToken}`))).status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it('handles network errors without exposing exception text', async () => {
    fetchMock.mockRejectedValue(new Error('fixture-private-detail'));
    const result = await get(request('/api/get?get=info', `session_id=${sessionToken}`));
    expect(result.status).toBe(502);
    expect(await result.text()).not.toContain('fixture-private-detail');
  });
  it('maps no active player to JSON null', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const result = await get(request('/api/get?get=player', `session_id=${sessionToken}`));
    expect(await result.json()).toBeNull();
  });
  it.each(['limit=0', 'limit=51', 'limit=1.5', 'time_range=bad', 'get=bad'])('rejects invalid input: %s', async query => {
    expect((await get(request(`/api/get?get=topTracks&${query}`, `session_id=${sessionToken}`))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('handles unavailable audio features without losing the tracks', async () => {
    fetchMock.mockResolvedValueOnce(json({ items: [{ id: 'fixture-track' }] })).mockResolvedValue(json({}, 403));
    const result = await get(request('/api/get?get=topTracks&analyze=true', `session_id=${sessionToken}`));
    const data = await result.json();
    expect(result.status).toBe(200);
    expect(data.tracks.items).toHaveLength(1);
    expect(data.analysisAvailable).toBe(false);
    expect(data.avgTempo).toBeNull();
  });
  it('calculates genre percentages once and handles no genres', async () => {
    fetchMock.mockResolvedValue(json({ items: [{ genres: ['rock', 'pop'] }, { genres: ['rock'] }] }));
    const result = await get(request('/api/get?get=topArtists&analyze=true', `session_id=${sessionToken}`));
    expect((await result.json()).genres).toEqual([{ id: 'rock', value: 66.7 }, { id: 'pop', value: 33.3 }]);
    fetchMock.mockResolvedValue(json({ items: [{ genres: [] }] }));
    const empty = await get(request('/api/get?get=topArtists&analyze=true', `session_id=${sessionToken}`));
    expect((await empty.json()).genres).toEqual([]);
  });
  it('averages the returned feature count rather than the requested limit', async () => {
    fetchMock.mockResolvedValueOnce(json({ items: [{ id: 'fixture-track' }] }))
      .mockResolvedValue(json({ tempo: 120, danceability: 0.5, liveness: 0.2, loudness: -5, valence: 0.4 }));
    const result = await get(request('/api/get?get=topTracks&limit=10&analyze=true', `session_id=${sessionToken}`));
    const data = await result.json();
    expect(data.analysisAvailable).toBe(true);
    expect(data.avgTempo).toBe(120);
  });
  it('returns a bounded rate-limit response without Spotify error details', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ private: 'fixture-private-detail' }), { status: 429, headers: { 'Retry-After': '3' } }));
    const result = await get(request('/api/get?get=info', `session_id=${sessionToken}`));
    expect(result.status).toBe(429);
    expect(result.headers.get('retry-after')).toBe('3');
    expect(await result.text()).not.toContain('fixture-private-detail');
  });
  it('handles fetch/network and database failures without logging sensitive exceptions', async () => {
    const log = vi.spyOn(console, 'error');
    db.connect.mockRejectedValue(new Error('fixture-private-detail'));
    const result = await get(request('/api/get?get=info', `session_id=${sessionToken}`));
    expect(result.status).toBe(500);
    expect(await result.text()).not.toContain('fixture-private-detail');
    expect(log).not.toHaveBeenCalled();
  });
  it('rejects cross-origin logout and invalidates a same-origin session', async () => {
    expect((await logout(request('/api/logout', `session_id=${sessionToken}`, 'POST', 'https://elsewhere.example.test'))).status).toBe(403);
    const result = await logout(request('/api/logout', `session_id=${sessionToken}`, 'POST', 'http://127.0.0.1:3000'));
    expect(result.status).toBe(303);
    expect(db.remove).toHaveBeenCalled();
    expect(result.cookies.get('session_id')?.value).toBe('');
  });
});
