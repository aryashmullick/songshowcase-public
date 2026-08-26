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

    return(
        <div className="col-span-2 grid grid-rows-5 h-screen grid-flow-row p-5 gap-y-0 [&>div]:bg-neutral-900/40 [&>div]:rounded-2xl ">
        <div className="row-span-1 p-2 [&_a]:p-1 h-max text-xl">
          <Link href="/dash" className={`${path==="/dash" && " font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-700"}`}><i className="bi bi-house"></i>{" "}Home</Link><br/>
          <Link href="/dash/top/track" className={`${path==="/dash/top/track" && " font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-700"}`}><i className="bi bi-graph-up"></i>{" "}Top 50 Tracks</Link><br/>
          <Link href="/dash/top/artist" className={`${path==="/dash/top/artist" && " font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-green-700"}`}><i className="bi bi-graph-up"></i>{" "}Top 50 Artists</Link><br/>

        </div>
        <div className="p-3 row-span-4 overflow-auto">
          <div className="flex items-center justify-between border-b border-neutral-700/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
              Your Playlists
            </span>
            <span className="rounded-full bg-green-700/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
              {playlists.length}
            </span>
          </div>
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={playlist.external_urls.spotify}
              target="_blank"
              className="group mt-2 flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-colors hover:border-green-700/40 hover:bg-green-700/10"
            >
              {playlist.images?.[0]?.url ? (
                <Image
                  src={playlist.images[0].url}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-800 text-green-500">
                  <i className="bi bi-music-note-list" />
                </span>
              )}
              <span className="min-w-0 truncate text-sm text-neutral-300 group-hover:text-green-400">
                {playlist.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    )
}