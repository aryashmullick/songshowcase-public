import { NextResponse } from "next/server";
import {redirect} from "next/navigation";
import * as querystring from "querystring";

const client_id = "REDACTED_CONFIGURATION";
const client_secret = "REDACTED_CONFIGURATION"
const url = "https://accounts.spotify.com/authorize?"

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

