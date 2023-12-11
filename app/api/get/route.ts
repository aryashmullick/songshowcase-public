import {redirect} from "next/navigation";
import * as querystring from "querystring";
import { useSearchParams } from 'next/navigation'
import { NextRequest,NextResponse } from "next/server";
import { cookies } from 'next/headers'



const client_id = "REDACTED_CONFIGURATION";
const client_secret = "REDACTED_CONFIGURATION"
const url = "https://accounts.spotify.com/api/token"

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
    },
  })
      .then((response) => {
        return response.json()
      })
}




export async function GET(req: NextRequest, res: NextResponse) {
    // @ts-ignore
    const { searchParams } = new URL(req.url);

    const cookie = cookies();
    let info:any = cookie.get("info") || undefined;
    let topArtists:any = cookie.get("top_artists") || undefined;
    console.log(topArtists)
    let topTracks:any = cookie.get("top_tracks") || undefined;
    info = JSON.parse(JSON.parse(info))
    topArtists = JSON.parse(JSON.parse(topArtists))
    topTracks = JSON.parse(JSON.parse(topTracks))
    if (!info) {
        return NextResponse.json({error: "Bad Request"}, {status: 400});
    }
    //  else {
    //     return NextResponse.json(JSON.parse(info["value"]));
    // }

    let struct = {
        info,
        topTracks,
        topArtists
    }
    console.log(struct)

     return NextResponse.json(struct);

}
