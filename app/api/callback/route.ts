import {redirect} from "next/navigation";
import * as querystring from "querystring";
import { useSearchParams } from 'next/navigation'
import { NextRequest, NextResponse } from "next/server";
import { parse, serialize } from 'cookie';
import { cookies } from 'next/headers'



const client_id = "REDACTED_CONFIGURATION";
const client_secret = "REDACTED_CONFIGURATION"
const url = "https://accounts.spotify.com/api/token"
const key = "I4C</XA@Rl*S4Kew*s)qB'w<;y6p]*sJ|hp*CW/pb£w+t2Y£?"
async function getData(code:string | null){
  return await fetch(url,
    {
        method: "POST",
        // @ts-ignore
        body: querystring.stringify({
          code: code,
          redirect_uri: "http://localhost:3000/api/callback",
          grant_type: 'authorization_code',
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
           // @ts-ignore
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
    })
      .then((response) => {
        return response.json()
      })
}

async function getInfo(code: string|null){
  return await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + code
    }
  })
      .then((response) => {
        return response.json()
      })
}


async function getTopArtists(code: string|null){
    return await fetch('https://api.spotify.com/v1/me/top/artists', {
    headers: {
      Authorization: 'Bearer ' + code
    },
  })
      .then((response) => {
        return response.json()
      })
}

async function getTopTracks(code: string|null){
    return await fetch('https://api.spotify.com/v1/me/top/tracks', {
    headers: {
      Authorization: 'Bearer ' + code
    },
  })
      .then((response) => {
        return response.json()
      })
}

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  let state = searchParams.get("state");
  let code = searchParams.get("code");
  let scope =
    "user-read-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-read";
  let data = await getData(code);
  // res.headers.set(
  //   "Set-Cookie",
  //   serialize("access_token", data["access_token"], { path: "/" })
  // );
  // res.headers.set(
  //   "Set-Cookie",
  //   serialize("refresh_token", data["refresh_token"], { path: "/" })
  // );
  let cookie = cookies()
  cookie.set("access_token",data["access_token"])
  cookie.set("refresh_token",data["refresh_token"])
  const token = data["access_token"];
  // let info = await getInfo(token);
  // let topArtists = await getTopArtists(token);
  // let topTracks = await getTopTracks(token);
  // console.log(JSON.stringify(topArtists))
  // console.log(topTracks)
  //   let struct = {
  //       info,
  //       topTracks,
  //       topArtists
  //   }

  // cookie.set("info",JSON.stringify(info))
  // cookie.set("top_tracks",JSON.stringify(topArtists))
  // cookie.set("top_artists",JSON.stringify(topTracks))
  // cookie.set("hello","yes")
  // cookie.set("sp_data",JSON.stringify(struct))

  return redirect("/dash");

}

