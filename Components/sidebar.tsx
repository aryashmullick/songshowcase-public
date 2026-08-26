"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function SideBar(){

    const path = usePathname().toLowerCase()
    const [playlists, setPlaylists] = useState<any[]>([])

    useEffect(() => {
      fetch("/api/get?get=playlists")
        .then((response) => response.ok ? response.json() : null)
        .then((data) => setPlaylists(data?.items ?? []))
        .catch(() => setPlaylists([]))
    }, [])

    return (
      <aside className="col-span-2 flex flex-col h-screen p-4 gap-4 overflow-hidden select-none">
        {/* Brand Header & Nav */}
        <div className=" rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 px-2 py-1">

            <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-200">
              SongShowcase
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              href="/dash"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                path === "/dash"
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
              }`}
            >
              <i className={`bi ${path === "/dash" ? "bi-house-door-fill text-green-400" : "bi-house-door"} text-base`}></i>
              <span>Home</span>
            </Link>

            <Link
              href="/dash/top/track"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                path === "/dash/top/track"
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
              }`}
            >
              <i className={`bi ${path === "/dash/top/track" ? "bi-music-note-beamed text-green-400" : "bi-music-note"} text-base`}></i>
              <span>Top 50 Tracks</span>
            </Link>

            <Link
              href="/dash/top/artist"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                path === "/dash/top/artist"
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
              }`}
            >
              <i className={`bi ${path === "/dash/top/artist" ? "bi-person-badge-fill text-green-400" : "bi-person-badge"} text-base`}></i>
              <span>Top 50 Artists</span>
            </Link>
          </nav>
        </div>

        {/* Playlists Section */}
        <div className="glass-card rounded-2xl p-4 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-2">
            <div className="flex items-center gap-2">
              {/* <i className="bi bi-collection-play text-green-400 text-sm"></i> */}
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Playlists
              </span>
            </div>
            <span className="rounded-full bg-green-500/15 border border-green-500/20 px-2 py-0.5 text-[11px] font-bold text-green-400">
              {playlists.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={playlist.external_urls.spotify}
                  target="_blank"
                  className="group flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all duration-200 hover:border-green-500/20 hover:bg-green-500/10"
                >
                  {playlist.images?.[0]?.url ? (
                    <Image
                      src={playlist.images[0].url}
                      alt=""
                      width={38}
                      height={38}
                      className="h-9 w-9 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-800/80 text-green-400 border border-white/5">
                      <i className="bi bi-music-note-list" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-neutral-300 group-hover:text-green-400 transition-colors">
                      {playlist.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      {playlist.tracks?.total ? `${playlist.tracks.total} tracks` : "Playlist"}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                No playlists loaded
              </div>
            )}
          </div>
        </div>
      </aside>
    )
}
