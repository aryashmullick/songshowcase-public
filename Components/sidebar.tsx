"use client";

import Link from "next/link";
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
        <div className="p-2 row-span-4 [&_div]:p-[0.5px] overflow-auto">
          <div>Your Playlists</div>
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={playlist.external_urls.spotify}
              target="_blank"
              className="block truncate hover:text-green-500"
            >
              {playlist.name}
            </Link>
          ))}
        </div>
      </div>
    )
}