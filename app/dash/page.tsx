"use client";
import { useCookies } from "react-cookie";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useRef,
  Fragment,
} from "react";
// import { cookies } from 'next/headers'
import { Transition, Menu, Dialog } from "@headlessui/react";
import localFont from "next/font/local";
// @ts-ignore
import styles from "./dash.module.css";
import Tilt from "react-parallax-tilt";
import Marquee from "react-fast-marquee";
// import "./ParallaxEffect.demozap.scss";
import { cache } from "react";
import { Marcellus } from "next/dist/compiled/@next/font/dist/google";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const blanka = localFont({
  src: "../../public/Blanka.otf",
  display: "swap",
  variable: "--font-blanka",
});
//
// function millisToMinutesAndSeconds(millis) {
//   var minutes = Math.floor(millis / 60000);
//   var seconds = ((millis % 60000) / 1000).toFixed(0);
//   return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
// }

export default function Home() {
  // const cookie:any = useCookies(["access_token"]);
  const [info, setInfo]: any = useState();
  const [topArtists, setTopArtists]: any = useState();
  const [topTracks, setTopTracks]: any = useState();
  const [infoOpen, setInfoOpen]: any = useState(false);
  const [cookie, setCookie]: any = useCookies(["access_token"]);
  const [player, setPlayer]: any = useState();
  const [playerDurationPercent, setPlayerDurationPercent]: any = useState(0);
  const [playerOpen, setPlayerOpen]: any = useState(false);
  const [term, setTerm]: any = useState("short_term");
  const [settings, setSettings]: any = useState(false);
  const [playerOverride, setPlayerOverride]: any = useState(false);
  const [playerOpenOnChange, setPlayerOpenOnChange]: any = useState(true);

  const playerStyle = {
    width: `${playerDurationPercent}%`,
  };

  const currentPlayer = (
    player: any,
    playerOverride: boolean,
    token: string,
    playerOpenOnChange: boolean,
  ) => {
    if (!playerOverride) {
      fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: "Bearer " + token,
        },
        cache: "no-cache",
      })
        .then((res) => {
          if (res.ok && res.status !== 204) {
            return res.json();
          } else {
            return;
          }
        })
        .then((data) => {
          if (data !== undefined) {
            if (
              player !== undefined &&
              player["item"]["name"] !== data["item"]["name"] &&
              playerOpenOnChange
            ) {
              setPlayerOpen(true);
              setTimeout(() => {
                setPlayerOpen(false);
              }, 3000);
            }
            setPlayer(data);
            setPlayerDurationPercent(
              (data["progress_ms"] / data["item"]["duration_ms"]) * 100,
            );
          }
        });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      currentPlayer(
        player,
        playerOverride,
        cookie["access_token"],
        playerOpenOnChange,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [cookie, player, playerOverride, playerOpenOnChange]);
  {
  }

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
      `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${term}`,
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
      `https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${term}`,
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
    currentPlayer(
      undefined,
      playerOverride,
      cookie["access_token"],
      playerOpenOnChange,
    );
  }, [term]);

  return (
    <main className={"select-none"}>
      <div
        className={
          "top-[4vh] relative grid grid-flow-col place-items-center justify-center items-center"
        }
      >
        <div className={"text-center text-2xl"}>
          {info ? (
            <Image
              src={info["images"][0]["url"]}
              alt="profile pic"
              className={"rounded-full"}
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
        <div className={" p-1 text-2xl grid  "}>
          {info ? (
            <span>
              Hello <span className={"font-bold"}>{info["display_name"]}</span>
            </span>
          ) : null}
        </div>
        {info && !settings && (
          <button
            onClick={() => {
              setSettings(!settings);
            }}
            className={"text-md text-gray-300/70"}
          >
            <i className={"bi bi-gear-wide-connected"}></i>
          </button>
        )}
      </div>
      <br />
      {/*<div*/}
      {/*  className={*/}
      {/*    // "justify-center grid items-center w-screen place-items-center text-center  z-[100] relative"*/}
      {/*  }*/}
      {/*>*/}
      <Transition appear show={settings} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 "
          onClose={() => {
            setSettings(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full  items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-screen max-w-md transform overflow-hidden bg-neutral-950 outline outline-green-600 rounded-2xl  p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h1"
                    className="text-xl font-medium leading-6 text-gray-300"
                  >
                    Settings
                  </Dialog.Title>
                  {info && (
                    <button
                      className={
                        "text-red-500 text-[10px] p-[2px] transition-transform hover:scale-105 rounded-sm hover:bg-red-500 hover:text-white outline-[0.5px] outline outline-red-500"
                      }
                    >
                      Logout
                    </button>
                  )}

                  <div className={"mt-4 grid grid-flow-col gap-1  "}>
                    <div>
                      {(topTracks || topArtists) && (
                        <div
                          className={
                            "grid place-items-center items-center justify-center"
                          }
                        >
                          <label
                            htmlFor={"top-item-select"}
                            className={" text-gray-300/70"}
                          >
                            Time period
                          </label>
                          <select
                            id={"top-item-select"}
                            className="border outline-green-900 outline focus:outline-dashed  text-sm rounded-lg block w-full p-2.5 bg-neutral-950 border-gray-600 placeholder-gray-400 text-white "
                            value={term}
                            onChange={(event) => {
                              setTerm(event.target.value);
                            }}
                          >
                            <option value={"short_term"}>4 weeks</option>
                            <option value="medium_term">6 months</option>
                            <option value="long_term">Several years</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div>
                      {player && (
                        <div
                          className={
                            "grid place-items-center items-center justify-center "
                          }
                        >
                          <label
                            // htmlFor={"top-item-select"}
                            className={" text-gray-300/70"}
                          >
                            Show player?
                          </label>
                          <button
                            id={"top-item-select"}
                            className={`border ${
                              !playerOverride
                                ? "outline-green-900"
                                : "outline-red-900"
                            } outline hover:outline-dashed text-sm rounded-lg block w-full p-2.5 bg-neutral-950 border-gray-600 placeholder-gray-400 text-white `}
                            onClick={() => {
                              setPlayerOverride(!playerOverride);
                            }}
                          >
                            {!playerOverride ? "Yes" : "No"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex transition-transform hover:scale-105 justify-center rounded-md border outline outline-sky-700 border-sky-200 px-4 py-2 text-sm font-medium text-blue-500 hover:outline-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        setSettings(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/*</div>*/}
      <br />
      <section
        id={"topArtists"}
        className={"sm:block lg:block md:block hidden"}
      >
        {topArtists && (
          <div
            className={
              "text-6xl text-center rounded-3xl bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-violet-500 font-semibold font-mono bg-green-600"
            }
          >
            Your Top Artists
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
                          } opacity-90 hover:opacity-100 hover:shadowAnimate shadow-[0_35px_120px_-25px_rgba(0,0,0,0.3)]`}
                          src={topArtists["items"][x]["images"][0]["url"]}
                          alt={""}
                          // layout={"fill"}
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
      </section>
      <br />
      <br />
      <br />
      <section
        id={"topTracks"}
        className={"mt-10 sm:block lg:block md:block hidden"}
      >
        {topTracks && (
          <div
            className={
              "text-6xl text-center rounded-3xl bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-sky-500 font-semibold font-mono bg-green-600"
            }
          >
            Your Top Tracks
          </div>
        )}
        <br />
        <div
          className={
            //           "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 grid-rows-5 xl:grid-rows-2 2xl:grid-rows-2 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-green-700 m-4"
            "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 xl:grid-rows-1 2xl:grid-rows-1 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-red-700 m-4"
          }
        >
          {topTracks ? (
            [0, 1, 2, 3, 4].map((x) => (
              <Link
                href={topTracks["items"][x]["external_urls"]["spotify"]}
                key={`${x}-top-songs`}
                className={
                  "grid grid-flow m-2 rows-2 hover:transform  transition-transform hover:scale-105" //hover:transform transition-transform hover:scale-105
                }
              >
                {/*<Transition show={topArtists !== undefined}>*/}
                <div className={`flex`}>
                  <div className="relative z-0 w-full h-full">
                    <div
                      className={`font-extrabold text-left absolute w-full text-9xl opacity-70 object-contain select-none blur-[0.px]  hover:blur-0 bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-violet-700`}
                    >
                      <p className={blanka.className}>{x + 1}</p>
                    </div>
                    <div
                      className={`text-green-600 absolute inset-0 ml-12 mt-2 object-contain z-10`}
                    >
                      <div className={"grid w-full "}>
                        <Image
                          className={`shadow-sky-800 hover:shadow-sky-500 opacity-90 hover:opacity-100  shadow-[0_35px_120px_-25px_rgba(0,0,0,0.3)]`}
                          src={
                            topTracks["items"][x]["album"]["images"][0]["url"]
                          }
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
      </section>
      <br />
      <br />
      <br />
      <br />
      <br />

      {/*{player && playerOpen && (*/}
      {/*  <div*/}
      {/*    className={" transition-all fixed left-0 bottom-0 text-center z-30"}*/}
      {/*  >*/}
      {/*    <div*/}
      {/*      className={`overflow-hidden bg-cover via-black via-30% p-2 grid grid-flow-col place-items-start justify-start w-max rounded-tr-2xl bg-gradient-to-tr from-slate-700 gap-2 mix-blend-darken ${*/}
      {/*        player["is_playing"] ? "to-green-900" : "to-red-900"*/}
      {/*      }`}*/}
      {/*    >*/}
      {/*      <div>*/}
      {/*        <Tilt tiltReverse={true}>*/}
      {/*          <Image*/}
      {/*            src={player["item"]["album"]["images"][0]["url"]}*/}
      {/*            alt={"Song pic"}*/}
      {/*            width={80}*/}
      {/*            height={80}*/}
      {/*            className={" z-40 hover:scale-105"}*/}
      {/*          />*/}
      {/*        </Tilt>*/}
      {/*      </div>*/}
      {/*      <div>*/}
      {/*        <span className={"text-sm"}>*/}
      {/*          Currently listening to:{" "}*/}
      {/*          {player["is_playing"] ? (*/}
      {/*            <i className={"bi bi-play-circle-fill"}></i>*/}
      {/*          ) : (*/}
      {/*            <i className={"bi bi-pause-circle-fill"}></i>*/}
      {/*          )}*/}
      {/*        </span>*/}
      {/*        <br />*/}
      {/*        <div className={"text-md "}>*/}
      {/*          /!*{player["item"]["name"].length > 20 ? (*!/*/}
      {/*          /!*  <p*!/*/}
      {/*          /!*    className={*!/*/}
      {/*          /!*      "text-ellipsis w-32 h-[1.2em] overflow-hidden whitespace-nowrap"*!/*/}
      {/*          /!*    }*!/*/}
      {/*          /!*  >*!/*/}
      {/*          /!*    <span>{player["item"]["name"]}</span>*!/*/}
      {/*          /!*  </p>*!/*/}
      {/*          /!*) : (*!/*/}
      {/*          /!*  // </div>*!/*/}
      {/*          /!*  <span>{player["item"]["name"]}</span>*!/*/}
      {/*          /!*)}{" "}*!/*/}
      {/*          <span className={"font-semibold"}>*/}
      {/*            {player["item"]["name"].length > 20 ? (*/}
      {/*              <div className={"w-[50vh]"}>*/}
      {/*                <Marquee pauseOnHover={true} className={""}>*/}
      {/*                  {player["item"]["name"]}&nbsp;*/}
      {/*                </Marquee>*/}
      {/*              </div>*/}
      {/*            ) : (*/}
      {/*              <div>{player && player["item"]["name"]}</div>*/}
      {/*            )}*/}
      {/*          </span>{" "}*/}
      {/*          {player && player["item"]["explicit"] && (*/}
      {/*            <i className="bi bi-explicit-fill text-sm"></i>*/}
      {/*          )}{" "}*/}
      {/*          /!*&#183;{" "}*!/*/}
      {/*          <span className={"text-sm"}>*/}
      {/*            {player && player["item"]["artists"][0]["name"]}*/}
      {/*          </span>*/}
      {/*        </div>{" "}*/}
      {/*        <div className="flex justify-between mb-1">*/}
      {/*          /!*<span className="text-base font-medium text-blue-700 dark:text-white">*!/*/}
      {/*          /!*  *!/*/}
      {/*          /!*</span>*!/*/}
      {/*          <span className="text-sm font-medium text-green-700 dark:text-white"></span>*/}
      {/*        </div>*/}
      {/*        <div className="w-full bg-gray-300/20 rounded-full h-1.5 ">*/}
      {/*          <div*/}
      {/*            className="bg-green-600 h-1.5 rounded-full blur-[0.2px]"*/}
      {/*            style={playerStyle}*/}
      {/*          ></div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*    <button*/}
      {/*      onClick={() => {*/}
      {/*        setPlayerOpen(!playerOpen);*/}
      {/*      }}*/}
      {/*      className={*/}
      {/*        "w-full flex bg-neutral-900/30 items-center justify-center place-items-center h-full"*/}
      {/*      }*/}
      {/*    >*/}
      {/*      <span className={"text-[10px]"}>*/}
      {/*        <i className="bi bi-chevron-double-down"></i>*/}
      {/*      </span>*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*  // </Transition>*/}
      {/*)}*/}

      {player && !playerOverride && (
        <div
          className={`grid left-1 outline outline-[0.5px] hover:outline-2 grid-flow-col  fixed bottom-1 rounded-full bg-neutral-950 ${
            player["is_playing"] ? "outline-green-900/70" : "outline-red-900/70"
          } `}
          onMouseEnter={() => {
            setPlayerOpen(true);
          }}
          onMouseLeave={() => {
            setPlayerOpen(false);
          }}
          onClick={() => {
            setPlayerOpen(!playerOpen);
          }}
        >
          <div
            className={`cursor-pointer flex h-12 w-12 justify-center items-center text-center`}
          >
            <CircularProgressbarWithChildren
              value={player && !playerOverride && playerDurationPercent}
              styles={buildStyles({
                trailColor: "rgba(46,44,44,0.13)",
                pathColor: `${
                  player && !playerOverride && player["is_playing"]
                    ? `rgb(34, 111, 13)`
                    : `rgba(185,22,41,0.63)`
                }`,
              })}
            >
              <Image
                src={
                  player &&
                  !playerOverride &&
                  player["item"]["album"]["images"][0]["url"]
                }
                alt={"Song pic"}
                width={64}
                height={64}
                className={"rounded-full z-40 p-1"}
              />
              <Transition
                show={!player["is_playing"]}
                enter="transition-all duration-500"
                enterFrom="scale-105 opacity-0"
                enterTo="scale-100 opacity-100"
                leave={"transition-all duration-500"}
                leaveFrom="scale-90 opacity-100"
                leaveTo="scale-0 opacity-0"
                className={"absolute z-50 p-1 rounded-2xl font-bold "}
              >
                <i
                  className={
                    "bi bg-neutral-800/70 rounded-full text-xl bi-pause"
                  }
                ></i>
              </Transition>
            </CircularProgressbarWithChildren>

            {/*//   <div*/}
            {/*//     className={`relative text-center  w-8 rounded-full justify-center place-items-center items-center flex border bg-green-500`}*/}
            {/*//   >*/}
            {/*//     <div*/}
            {/*//       onClick={() => {*/}
            {/*//         setPlayerOpen(!playerOpen);*/}
            {/*//       }}*/}
            {/*//       className={*/}
            {/*//         "w-8 h-8 rounded-full z-10 flex bg-neutral-900/40 items-center justify-center place-items-center "*/}
            {/*//       }*/}
            {/*//     >*/}
            {/*//       <span className={"text-[10px]"}>*/}
            {/*//         <i className="bi bi-chevron-double-up"></i>*/}
            {/*//       </span>*/}
            {/*//     </div>*/}
            {/*//   </div>*/}
          </div>
          {/*{player && playerOpen && (*/}
          <Transition
            show={playerOpen}
            enter="transition-all duration-1000"
            enterFrom="scale-105 opacity-0"
            enterTo="scale-100 opacity-100"
            leave={"transition-all duration-300"}
            leaveFrom="scale-50 opacity-100"
            leaveTo="scale-0 opacity-0"
            className={`select-none place-items-center grid grid-flow-col gap-1 p-2 rounded-md justify-center text-center text-md items-center `}
          >
            {/*<div>*/}
            {/*  <span>{player["item"]["name"]}</span>*/}
            {/*)}{" "}*/}
            <span className={"font-semibold"}>
              {player["item"]["name"].length > 20 ? (
                <div className={"w-[30vh]"}>
                  <Marquee
                    pauseOnHover={true}
                    delay={1}
                    className={"rounded-full"}
                  >
                    {player["item"]["name"]}&nbsp;
                  </Marquee>
                </div>
              ) : (
                <div>{player && !playerOverride && player["item"]["name"]}</div>
              )}
            </span>{" "}
            {player && !playerOverride && player["item"]["explicit"] && (
              <i className="bi bi-explicit-fill text-sm"></i>
            )}{" "}
            &#183;{" "}
            <span className={"text-sm"}>
              {player &&
                !playerOverride &&
                player["item"]["artists"][0]["name"]}
            </span>
            {/*</div>*/}
          </Transition>
          {/*)}*/}
        </div>
      )}
    </main>
  );
}
