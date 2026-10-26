import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { readSession } from '@/app/lib/backend';


export default async function Home() {
  const cookie = await cookies();
  let session = null;
  try { session = await readSession(cookie.get('session_id')?.value); } catch { /* The login page remains available during a DB outage. */ }
  if (session) redirect('/dash');

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full rounded-3xl p-10 text-center shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Brand Icon */}
        

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-300 to-sky-400 mb-3">
          SongShowcase
        </h1>



        <Link
          href="/api/login"
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-semibold text-neutral-950 bg-green-400 hover:bg-green-300 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
        >
          <i className="bi bi-spotify text-xl"></i>
          <span>Log in with Spotify</span>
          <i className="bi bi-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
        </Link>
      </div>
    </main>
  );
}

