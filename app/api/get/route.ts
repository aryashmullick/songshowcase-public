import { redirect } from "next/navigation";
import * as querystring from "querystring";
import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/app/lib/connectDB";
import UserInfo from "@/Models/UserInfo";
import UserSession from "@/Models/UserSession";

const client_id = process.env.SP_CLIENT_ID;
const client_secret = process.env.SP_CLIENT_SECRET;
const url = "https://accounts.spotify.com/api/token";
export const dynamic = "force-dynamic";

async function getInfo(code: string | null) {
  return await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + code,
    },
  }).then((response) => {
    if (response.status === 401) {
      return 401;
    }
    return response.json();
  });
}

async function getTopArtists(
  code: string | null,
  time_range: string,
  limit: string,
) {
  return await fetch(
    `https://api.spotify.com/v1/me/top/artists/?limit=${limit}&time_range=${time_range}`,
    {
      headers: {
        Authorization: "Bearer " + code,
      },
    },
  ).then((response) => {
    return response.json();
  });
}

async function getTopTracks(
  code: string | null,
  time_range: string,
  limit: string | number,
) {
  return await fetch(
    `https://api.spotify.com/v1/me/top/tracks/?limit=${limit}&time_range=${time_range}`,
    {
      headers: {
        Authorization: "Bearer " + code,
      },
    },
  ).then((response) => {
    return response.json();
  });
}

async function getPlaylists(code: string | null) {
  return await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: {
        Authorization: "Bearer " + code,
      },
    },
  ).then((response) => {
    return response.json();
  });
}

async function getCurrentTrack(code: string | null) {
  const response = await fetch(`https://api.spotify.com/v1/me/player`, {
    headers: {
      Authorization: "Bearer " + code,
    },
  });
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function getTrackFeatures(code: string | null, track_ids: string) {
  const audio_features = await Promise.all(
    track_ids.split(",").map((track_id) =>
      fetch(`https://api.spotify.com/v1/audio-features/${track_id}`, {
        headers: {
          Authorization: "Bearer " + code,
        },
      }).then((response) => response.json()),
    ),
  );
  return { audio_features };
}

export async function GET(req: NextRequest, res: NextResponse) {
  await connectDB();
  // @ts-ignore
  const { searchParams } = new URL(req.url);
  let get = searchParams.get("get");
  let time_range = searchParams.get("time_range") || "short_term";
  let limit = searchParams.get("limit") || "10";
  let offset = searchParams.get("offset") || "0";
  let analyze = searchParams.get("analyze") || "false";

  if (!get) {
    return NextResponse.json({ error: "Nothing specified" }, { status: 400 });
  }

  const cookie = cookies();
  let session: any = cookie.get("session_id") || undefined;
  let id: any = cookie.get("sp_id") || undefined;

  if (!session || !id) {
    return NextResponse.json(
      { error: "Could not verify session" },
      { status: 400 },
    );
  }

  let user: any = await UserSession.findOne(
    {
      session_id: session.value,
      sp_id: id.value,
    },
    "sp_access_token sp_refresh_token updatedAt",
  ).exec();

  let ONE_HOUR = 60 * 60 * 1000;
  let updateTime = new Date(user["updatedAt"]);
  let now = new Date();

  //@ts-ignore
  if (now - updateTime > ONE_HOUR) {
    const refresh = await fetch("http://127.0.0.1:3000/api/refresh/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
    });
    console.log(refresh.status);
    if (refresh.status !== 200) {
      return NextResponse.json(
        { message: refresh.statusText },
        { status: refresh.status },
      );
    } else {
      user = await UserSession.findOne(
        {
          session_id: session.value,
          sp_id: id.value,
        },
        "sp_access_token sp_refresh_token",
      ).exec();
    }
  }

  switch (get) {
    case "info":
      let info = await getInfo(user["sp_access_token"]);
      return NextResponse.json(info);
    case "topArtists":
      let topArtists = await getTopArtists(
        user["sp_access_token"],
        time_range,
        limit,
      );

      if (analyze === "true") {
        let genres: { [genre: string]: number } = {};
        let totalGenres = 0;
        topArtists["items"].map((item: { [x: string]: any[] }) => {
          console.log(item["genres"]);
          item["genres"].map((i) => {
            if (Object.keys(genres).includes(i)) {
              genres[i] += 1;
            } else {
              genres[i] = 1;
            }
            totalGenres += 1;
          });
        });
        let genreL: { id: string; value: number }[] = [];
        Object.keys(genres).map((x) => {
          genres[x] = (genres[x] * 100) / totalGenres;
          genreL.push({
            id: x,
            value: Math.round((genres[x] * 1000) / totalGenres) / 10,
          });
        });
        return NextResponse.json({
          limit,
          offset,
          time_range,
          genres: genreL,
          // genreLabels: Object.keys(genres),
          // genreValues: Object.values(genres),
          totalGenres,
          artists: topArtists,
        });
      }
      return NextResponse.json({ artists: topArtists });
    case "topTracks":
      let topTracks = await getTopTracks(
        user["sp_access_token"],
        time_range,
        limit,
      );
      if (analyze == "true") {
        let track_ids = "";
        topTracks["items"].map((i: any) => {
          track_ids = track_ids + i["id"] + ",";
        });
        track_ids = track_ids.slice(0, -1);
        let trackAnalysis = await getTrackFeatures(
          user["sp_access_token"],
          track_ids,
        );
        let tempo = 0;
        let danceability = 0;
        let liveness = 0;
        let loudness = 0;
        let valence = 0;
        trackAnalysis["audio_features"].map((f: any) => {
          tempo += f["tempo"];
          danceability += f["danceability"];
          liveness += f["liveness"];
          loudness += f["loudness"];
          valence += f["valence"];
        });
        tempo = tempo / Number(limit);
        danceability = danceability / Number(limit);
        liveness = liveness / Number(limit);
        loudness = loudness / Number(limit);
        valence = valence / Number(limit);
        return NextResponse.json({
          tracks: topTracks,
          trackAnalysis,
          track_ids,
          avgTempo: tempo,
          avgDanceability: danceability,
          avgLiveness: liveness,
          avgLoudness: loudness,
          avgValence: valence,
        });
      }
      return NextResponse.json({ tracks: topTracks });
    case "playlists":
      let playlists = await getPlaylists(user["sp_access_token"]);
      return NextResponse.json(playlists);
    case "player":
      let player = await getCurrentTrack(user["sp_access_token"]);
      return NextResponse.json(player);
    default:
      return NextResponse.json(
        { error: "Invalid specifications" },
        { status: 400 },
      );
  }

  return NextResponse.json({ message: "Invalid request" }, { status: 400 });
}
