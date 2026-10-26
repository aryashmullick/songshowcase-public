import { NextRequest, NextResponse } from 'next/server';
import { apiError, HttpError, privateResponse, requireSession, spotifyRequest } from '@/app/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const params = request.nextUrl.searchParams;
    const get = params.get('get');
    const timeRange = params.get('time_range') || 'short_term';
    const limitText = params.get('limit') || '10';
    const limit = Number(limitText);
    const analyze = params.get('analyze') === 'true';
    if (params.getAll('get').length !== 1 || !['info', 'topArtists', 'topTracks', 'playlists', 'player'].includes(get || '') ||
        !['short_term', 'medium_term', 'long_term'].includes(timeRange) ||
        !/^\d+$/.test(limitText) || !Number.isInteger(limit) || limit < 1 || limit > 50) throw new HttpError(400, 'Invalid request parameters');
    const query = new URLSearchParams({ limit: String(limit), time_range: timeRange });
    let data: any;
    switch (get) {
      case 'info': {
        const profile = await spotifyRequest(session, '/me');
        if (!profile || !profile.id) throw new HttpError(502, 'Spotify returned an invalid profile');
        data = { id: profile.id, display_name: profile.display_name, images: profile.images ?? [], external_urls: profile.external_urls };
        break;
      }
      case 'player': data = await spotifyRequest(session, '/me/player'); break;
      case 'playlists': data = await spotifyRequest(session, '/me/playlists?limit=50'); break;
      case 'topArtists': {
        const artists = await spotifyRequest(session, `/me/top/artists?${query}`);
        if (!Array.isArray(artists?.items)) throw new HttpError(502, 'Spotify returned an invalid artist list');
        data = { artists };
        if (analyze) {
          const counts: Record<string, number> = Object.create(null);
          let totalGenres = 0;
          for (const artist of artists.items) for (const genre of artist.genres ?? []) {
            counts[genre] = (counts[genre] ?? 0) + 1; totalGenres++;
          }
          data = { ...data, limit: String(limit), time_range: timeRange, totalGenres,
            genres: Object.entries(counts).map(([id, count]) => ({ id, value: Math.round(count / totalGenres * 1000) / 10 })) };
        }
        break;
      }
      case 'topTracks': {
        const tracks = await spotifyRequest(session, `/me/top/tracks?${query}`);
        if (!Array.isArray(tracks?.items)) throw new HttpError(502, 'Spotify returned an invalid track list');
        data = { tracks };
        if (analyze) {
          const features: any[] = [];
          let unavailable = false;
          // Sequential requests bound concurrency; stop if this app cannot use Audio Features.
          for (const track of tracks.items) {
            if (!/^[A-Za-z0-9_-]+$/.test(track.id)) continue;
            try { const feature = await spotifyRequest(session, `/audio-features/${encodeURIComponent(track.id)}`); if (feature) features.push(feature); }
            catch (error) {
              if (error instanceof HttpError && [403, 502].includes(error.status)) { unavailable = true; break; }
              throw error;
            }
          }
          const fields = ['tempo', 'danceability', 'liveness', 'loudness', 'valence'] as const;
          const usable = features.filter(f => fields.every(key => typeof f[key] === 'number' && Number.isFinite(f[key])));
          const available = !unavailable && usable.length > 0;
          data = { ...data, trackAnalysis: { audio_features: available ? usable : [] }, analysisAvailable: available,
            track_ids: tracks.items.map((t: any) => t.id).join(','),
            avgTempo: available ? usable.reduce((n, f) => n + f.tempo, 0) / usable.length : null,
            avgDanceability: available ? usable.reduce((n, f) => n + f.danceability, 0) / usable.length : null,
            avgLiveness: available ? usable.reduce((n, f) => n + f.liveness, 0) / usable.length : null,
            avgLoudness: available ? usable.reduce((n, f) => n + f.loudness, 0) / usable.length : null,
            avgValence: available ? usable.reduce((n, f) => n + f.valence, 0) / usable.length : null };
        }
        break;
      }
    }
    return privateResponse(NextResponse.json(data));
  } catch (error) { return apiError(error); }
}
