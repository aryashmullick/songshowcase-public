import { NextResponse } from "next/server";
import {redirect} from "next/navigation";
import * as querystring from "querystring";

const client_id = process.env.SP_CLIENT_ID
const client_secret = process.env.SP_CLIENT_SECRET
const url = "https://accounts.spotify.com/authorize?"

import { createClient } from '@supabase/supabase-js'

async function signInWithSpotify() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify',
  })
}

export const supabase = createClient(
  // @ts-ignore
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request:any) {
  let state = (Math.random() * 10000) + 1000
  let scope = "user-read-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-read"
  let finalURL = url +
      querystring.stringify({
        response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: "http://localhost:3000/api/callback",
      state: state
      })

  return redirect(finalURL)
}

