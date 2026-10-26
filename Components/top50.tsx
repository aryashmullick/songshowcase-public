"use client";
import { apiFetch } from '@/app/lib/client-api';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopFifty({ artist, track }: { artist: boolean; track: boolean }) {
  const [error, setError] = useState('');
  const [topArtists, setTopArtists] = useState<any>();
  const [topTracks, setTopTracks] = useState<any>();

  useEffect(() => {
    if (artist) {
      apiFetch("/api/get?get=topArtists&limit=50&time_range=short_term", {
        // cache: "force-cache",
      })
        .then((res) => res.json())
        .then((data) => {
          setTopArtists(data["artists"]);
        }).catch((error: Error) => setError(error.message));
    }

    if (track) {
      apiFetch("/api/get?get=topTracks&limit=50&time_range=short_term", {
        // cache: "force-cache",
      })
        .then((res) => res.json())
        .then((data) => {
          setTopTracks(data["tracks"]);
        }).catch((error: Error) => setError(error.message));
    }
  }, [artist, track]);
  return (
    <main className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {error && <p role="alert" className="text-amber-300">{error}</p>}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-300 to-sky-400">
            {artist ? "Top 50 Artists" : "Top 50 Tracks"}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            {artist
              ? "Your most listened to artists over your recent listening history."
              : "Your most played tracks on repeat recently."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dash"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 glass-card-hover border border-white/10"
          >
            <i className="bi bi-arrow-left"></i> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-2.5">
        {artist &&
          topArtists &&
          topArtists["items"].map((x: any, i: number): any => (
            <Link
              key={`top-artist-${i + 1}`}
              href={x["external_urls"]["spotify"]}
              target="_blank"
              className="glass-card glass-card-hover rounded-2xl p-3.5 flex items-center justify-between gap-4 group transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Rank Badge */}
                <div className="w-9 text-center font-extrabold text-lg text-neutral-500 group-hover:text-green-400 transition-colors">
                  #{i + 1}
                </div>

                {/* Artist Cover Image */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/10 group-hover:border-green-500/40">
                  <Image
                    src={x["images"][0]["url"]}
                    fill
                    alt={x["name"]}
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <h3 className="font-bold text-neutral-100 text-base group-hover:text-green-400 truncate transition-colors">
                    {x["name"]}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-400 capitalize">
                      {x["genres"]?.[0] || "Artist"}
                    </span>
                    {x["popularity"] && (
                      <span className="text-[10px] px-2 py-0.5  text-neutral-400">
                        {x["popularity"]}% popularity
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-green-500/20 group-hover:border-green-500/30 text-neutral-400 group-hover:text-green-400 transition-all text-xs font-semibold">
                <i className="bi bi-spotify text-base"></i>
                <span className="hidden sm:inline">Open in Spotify</span>
              </div>
            </Link>
          ))}

        {track &&
          topTracks &&
          topTracks["items"].map((x: any, i: number): any => (
            <Link
              key={`top-track-${i + 1}`}
              href={x["external_urls"]["spotify"]}
              target="_blank"
              className="glass-card glass-card-hover rounded-2xl p-3.5 flex items-center justify-between gap-4 group transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Rank Badge */}
                <div className="w-9 text-center font-extrabold text-lg text-neutral-500 group-hover:text-green-400 transition-colors">
                  #{i + 1}
                </div>

                {/* Track Album Image */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/10 group-hover:border-green-500/40">
                  <Image
                    src={x["album"]["images"][0]["url"]}
                    fill
                    alt={x["name"]}
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Track Details */}
                <div className="min-w-0">
                  <h3 className="font-bold text-neutral-100 text-base group-hover:text-green-400 truncate transition-colors">
                    {x["name"]}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {x["artists"]?.map((a: any) => a.name).join(", ")} &bull; {x["album"]["name"]}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-green-500/20 group-hover:border-green-500/30 text-neutral-400 group-hover:text-green-400 transition-all text-xs font-semibold">
                <i className="bi bi-spotify text-base"></i>
              </div>
            </Link>
          ))}
      </div>
    </main>
  );
}

