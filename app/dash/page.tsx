"use client";
import { useCookies } from "react-cookie";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useLayoutEffect } from "react";
// import { cookies } from 'next/headers'
import { Transition, Menu } from "@headlessui/react";
import localFont from "next/font/local";
import "./dash.css";
import Tilt from "react-parallax-tilt";
import Marquee from "react-fast-marquee";

import { cache } from "react";
import { Marcellus } from "next/dist/compiled/@next/font/dist/google";

const blanka = localFont({
  src: "../../public/Blanka.otf",
  display: "swap",
  variable: "--font-blanka",
});

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export default function Home() {
  // const cookie:any = useCookies(["access_token"]);
  const [info, setInfo]: any = useState();
  const [topArtists, setTopArtists]: any = useState();
  const [topTracks, setTopTracks]: any = useState();
  const [infoOpen, setInfoOpen]: any = useState(false);
  const [cookie, setCookie]: any = useCookies(["access_token"]);
  const [player, setPlayer]: any = useState();
  const [playerDurationPercent, setPlayerDurationPercent]: any = useState(0);

  const playerStyle = {
    width: `${playerDurationPercent}%`,
  };

  const currentPlayer = (token: any) => {
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: "Bearer " + token,
      },
      cache: "no-cache",
      // next : {tags: ["topArtists","sp"]}
      next: { revalidate: 10 },
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        setPlayer(data);
        setPlayerDurationPercent(
          (data["progress_ms"] / data["item"]["duration_ms"]) * 100,
        );
        // console.log("data", data["items"]);
      });

    setTimeout(() => {
      currentPlayer(token);
    }, 10000);
  };

  useEffect(() => {
    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + cookie["access_token"],
      },
      cache: "force-cache",
    })
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      });
    fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term",
      {
        headers: {
          Authorization: "Bearer " + cookie["access_token"],
        },
        cache: "force-cache",
        // next : {tags: ["topTracks","sp"]}
        // // next : {revalidate: 10000}
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setTopTracks(data);
      });
    fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=10&time_range=short_term",
      {
        headers: {
          Authorization: "Bearer " + cookie["access_token"],
        },
        cache: "force-cache",
        // next : {tags: ["topArtists","sp"]}
        // // next : {revalidate: 10000}
      },
    )
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        setTopArtists(data);
        console.log("data", data["items"]);
      });
    currentPlayer(cookie["access_token"]);
  }, []);

  return (
    <main>
      <div>
        <div className="place-items-center sticky top-0 z-10">
          <div className="p-2">
            <div className="flow-root">
              <Menu>
                {/*{info["display_name"]}*/}
                <div
                  className={
                    "flow-root float-right rounded-md hover:dark:bg-gray-500/20 p-2 "
                  }
                >
                  <Menu.Button>
                    <div
                      onClick={() => setInfoOpen(!infoOpen)}
                      className={"cursor-pointer"}
                    >
                      <div className={"float-right font-bold p-1 "}>
                        {info ? info["display_name"] : null}
                      </div>
                      <div className={"text-center float-right "}>
                        {info ? (
                          <Image
                            src={info["images"][0]["url"]}
                            alt="profile pic"
                            className={"rounded-md"}
                            width={30}
                            height={30}
                          />
                        ) : (
                          <div className="flex animate-pulse">
                            <div className="flex-shrink-0">
                              <span className="h-10 w-16 block bg-gray-200 rounded-md dark:bg-gray-700"></span>
                            </div>
                          </div>
                        )}
                      </div>
                      <br />
                    </div>
                  </Menu.Button>

                  {infoOpen && info ? (
                    <div className={"text-right z-10 text-sm font-semibold "}>
                      <Menu.Items>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href={info["external_urls"]["spotify"]}
                              target={"_blank"}
                              className={"text-[10px] text-gray-200/30"}
                            >
                              {info["id"]}
                            </Link>
                          )}
                        </Menu.Item>
                        <br />
                        <Menu.Item>
                          {({ active }) => (
                            <Link href={"/"} className={"text-red-600  "}>
                              Logout
                            </Link>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </div>
                  ) : null}
                </div>
              </Menu>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <div></div>
      {topArtists && (
        <div
          className={
            "text-6xl text-center rounded-3xl bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-violet-500 font-semibold font-mono bg-green-600"
          }
        >
          Your top artists
        </div>
      )}
      <br />
      <div
        className={
          //           "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 grid-rows-5 xl:grid-rows-2 2xl:grid-rows-2 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-green-700 m-4"
          "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 xl:grid-rows-1 2xl:grid-rows-1 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-green-700 m-4"
        }
      >
        {topArtists ? (
          [0, 1, 2, 3, 4].map((x) => (
            <Link
              href={topArtists["items"][x]["external_urls"]["spotify"]}
              key={`${x}-top-artist`}
              className={
                "grid grid-flow m-2 rows-2 hover:transform  transition-transform hover:scale-105" //hover:transform transition-transform hover:scale-105
              }
            >
              {/*<Transition show={topArtists !== undefined}>*/}
              <div className={`flex`}>
                <div className="relative z-0 w-full h-full">
                  <div
                    className={`font-extrabold text-left absolute w-full text-9xl opacity-70 object-contain select-none blur-[0.px]  hover:blur-0 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-violet-500`}
                  >
                    <p className={blanka.className}>{x + 1}</p>
                  </div>
                  <div
                    className={`text-green-600 absolute inset-0 ml-12 mt-2 object-contain z-10`}
                  >
                    <div className={"grid w-full "}>
                      <Image
                        className={`${
                          x <= 4
                            ? "shadow-green-800 hover:shadow-green-500"
                            : "shadow-sky-800 hover:shadow-sky-500"
                        } opacity-90 hover:opacity-95 hover:shadowAnimate hover:shadow-[0_25px_1020px_-25px_rgba(0,0,0,0.3)] shadow-[0_35px_120px_-25px_rgba(0,0,0,0.3)]`}
                        key={x}
                        src={topArtists["items"][x]["images"][0]["url"]}
                        alt={""}
                        width={128}
                        height={128}
                      />
                    </div>
                    <div className={"text-md w-3/4 font-extrabold"}>
                      {topArtists["items"][x]["name"]}
                    </div>
                  </div>
                </div>
              </div>
              {/*</Transition>*/}
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </Link>
          ))
        ) : (
          <div className="flex animate-pulse">
            <div className="flex-shrink-0">
              <span className="h-screen w-5/6 block bg-gray-200 rounded-md dark:bg-gray-700"></span>
            </div>
          </div>
        )}
      </div>
      <br />
      <br />
      {topTracks && (
        <div
          className={
            "text-6xl text-center rounded-3xl bg-clip-text text-transparent bg-gradient-to-r to-green-500 from-violet-500 font-semibold font-mono bg-green-600"
          }
        >
          Your top tracks
        </div>
      )}
      <br />
      <div
        className={
          "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 grid-rows-5 xl:grid-rows-2 2xl:grid-rows-2 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-green-700 m-4"
        }
      >
        {topTracks ? (
          [0, 1, 2, 3, 4].map((x) => (
            <Link
              href={topTracks["items"][x]["external_urls"]["spotify"]}
              key={`${x}-top-tracks`}
              className={
                "grid grid-flow m-2 rows-2 hover:transform transition-transform hover:scale-105" //hover:transform transition-transform hover:scale-105
              }
            >
              <div className="flex">
                <div className="relative z-0 w-full h-full">
                  <div
                    className={`font-extrabold text-left absolute w-full text-9xl opacity-70 object-contain select-none blur-[0.px] hover:blur-0 bg-clip-text text-transparent bg-gradient-radial from-sky-700 to-violet-500`}
                  >
                    <p className={blanka.className}>{x + 1}</p>
                  </div>
                  <div
                    className={`text-green-600 absolute inset-0 ml-12 mt-2 object-contain z-10`}
                  >
                    <div className={"grid w-full "}>
                      <Image
                        className={`${
                          x <= 4
                            ? "shadow-green-800 hover:shadow-green-500"
                            : "shadow-sky-800 hover:shadow-sky-500"
                        } opacity-90 hover:opacity-95 hover:shadowAnimate hover:shadow-[0_25px_1020px_-25px_rgba(0,0,0,0.3)] shadow-[0_35px_120px_-25px_rgba(0,0,0,0.3)]`}
                        key={x}
                        src={topTracks["items"][x]["album"]["images"][0]["url"]}
                        alt={""}
                        width={128}
                        height={128}
                      />
                    </div>
                    <div className={"text-md w-3/4 font-extrabold"}>
                      {topTracks["items"][x]["name"]}
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </Link>
          ))
        ) : (
          <div className="flex animate-pulse">
            <div className="flex-shrink-0">
              <span className="h-screen w-5/6 block bg-gray-200 rounded-md dark:bg-gray-700"></span>
            </div>
          </div>
        )}
        <br />
        <br />
      </div>

      {player && (
        <div className={"sticky  bottom-0 left-0 text-center"}>
          <div
            className={
              "p-2 grid grid-flow-col place-items-start justify-start w-max rounded-tr-2xl bg-gradient-to-tr to-green-900 from-slate-700 gap-2 mix-blend-darken"
            }
          >
            <div>
              <Image
                src={player["item"]["album"]["images"][0]["url"]}
                alt={"Song pic"}
                width={64}
                height={64}
                className={"rounded-md"}
              />
            </div>
            <div>
              <span className={"text-sm"}>
                Currently listening to:{" "}
                {player["is_playing"] ? (
                  <i className={"bi bi-play-btn-fill"}></i>
                ) : (
                  <i className={"bi bi-pause-btn-fill"}></i>
                )}
              </span>
              <br />
              <div className={"text-lg font-extrabold"}>
                {/*{player["item"]["name"].length > 20 ? (*/}
                {/*  <p*/}
                {/*    className={*/}
                {/*      "text-ellipsis w-32 h-[1.2em] overflow-hidden whitespace-nowrap"*/}
                {/*    }*/}
                {/*  >*/}
                {/*    <span>{player["item"]["name"]}</span>*/}
                {/*  </p>*/}
                {/*) : (*/}
                {/*  // </div>*/}
                {/*  <span>{player["item"]["name"]}</span>*/}
                {/*)}{" "}*/}
                <span>{player["item"]["name"]}</span>{" "}
                {player["item"]["explicit"] && (
                  <i className="bi bi-explicit-fill text-sm"></i>
                )}{" "}
                &#183;{" "}
                <span className={"text-sm"}>
                  {player["item"]["artists"][0]["name"]}
                </span>
              </div>{" "}
              <div className="flex justify-between mb-1">
                {/*<span className="text-base font-medium text-blue-700 dark:text-white">*/}
                {/*  */}
                {/*</span>*/}
                <span className="text-sm font-medium text-green-700 dark:text-white"></span>
              </div>
              <div className="w-full bg-gray-300/20 rounded-full h-1.5 ">
                <div
                  className="bg-green-600 h-1.5 rounded-full"
                  style={playerStyle}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
