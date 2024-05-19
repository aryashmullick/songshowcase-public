"use client";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// @ts-ignore
export default function TopFifty({ artist, track }) {
  const [info, setInfo] = useState();
  const [topArtists, setTopArtists] = useState();
  const [topTracks, setTopTracks] = useState();

  useEffect(() => {
    if (artist === undefined && track === undefined) {
      redirect("/");
    }

    fetch("/api/get?get=info", {
      // cache: "force-cache",
    })
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      });

    if (artist !== undefined) {
      fetch("/api/get?get=topArtists&limit=50&time_range=short_term", {
        // cache: "force-cache",
      })
        .then((res) => res.json())
        .then((data) => {
          setTopArtists(data["artists"]);
        });
    }

    if (track !== undefined) {
      fetch("/api/get?get=topTracks&limit=50&time_range=short_term", {
        // cache: "force-cache",
      })
        .then((res) => res.json())
        .then((data) => {
          setTopTracks(data["tracks"]);
        });
    }
  }, [artist, track]);
  return (
    <main>
      <div className={"select-none grid place-items-center"}>
        <div
          className={
            "h-screen max-h-screen flex flex-col items-center justify-between w-full "
          }
        >
          <table
            className={
              "[&_td]:p-1  table-auto overflow-scroll w-3/4 resize-none text-[14px] rounded-3xl"
            }
          >
            {artist &&
              topArtists &&
              topArtists["items"].map((x: any, i: number): any => (
                <tr
                  key={`top-artist-${i + 1}`}
                  className={
                    " even:bg-neutral-900/20 hover:scale-105 hover:font-extrabold rounded-xl  hover:bg-gradient-to-l hover:from-green-700/20 hover:to-blue-700/20 hover:border-2 hover:border-green-700  hover:p-10 hover:m-10 transition"
                  }
                >
                  <td className={"p-2"}>{i + 1}.</td>
                  <td>
                    <Image
                      src={x["images"][0]["url"]}
                      height={64}
                      width={64}
                      alt={`Image of ${x["name"]}`}
                      className={"rounded-md border-2 border-green-700"}
                    />
                  </td>
                  <td className={"p-2"}>
                    <b>{x["name"]}</b>
                  </td>
                  <td>options</td>
                </tr>
              ))}

            {track &&
              topTracks &&
              topTracks["items"].map((x: any, i: number): any => (
                <tr
                  key={`top-artist-${i + 1}`}
                  className={
                    " even:bg-neutral-900/20 hover:scale-105 hover:font-extrabold rounded-xl  hover:bg-gradient-to-l hover:from-green-700/20 hover:to-blue-700/20 hover:border-2 hover:border-green-700  hover:p-10 hover:m-10 transition"
                  }
                >
                  <td className={"p-2"}>{i + 1}.</td>
                  <td>
                    <Image
                      src={x["album"]["images"][0]["url"]}
                      height={64}
                      width={64}
                      alt={`Image of ${x["name"]}`}
                      className={"rounded-md border-2 border-green-700"}
                    />
                  </td>
                  <td className={"p-2"}>
                    <b>{x["name"]}</b>
                  </td>
                  <td>options</td>
                </tr>
              ))}
          </table>
        </div>
      </div>
      <br />
      <br />
    </main>
  );
}
