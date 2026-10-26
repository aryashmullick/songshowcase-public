"use client";
import { apiFetch } from '@/app/lib/client-api';
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
// @ts-ignore

import "react-circular-progressbar/dist/styles.css";
import Player from "@/Components/player";
import dynamic from "next/dynamic";
// import WavesSVG from "@/public/layered-waves-haikei (1).svg"
// import { ResponsivePie, ResponsivePieCanvas } from "@nivo/pie";
const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((mod) => mod.ResponsivePie),
  { ssr: true },
);

export default function Home() {
  const [error, setError] = useState('');
  const [info, setInfo]: any = useState();
  const [topArtists, setTopArtists]: any = useState();
  const [topTracks, setTopTracks]: any = useState();
  const [infoOpen, setInfoOpen]: any = useState(false);
  const [player, setPlayer]: any = useState();
  const [playerDurationPercent, setPlayerDurationPercent]: any = useState(0);
  const [playerOpen, setPlayerOpen]: any = useState(false);
  const [term, setTerm]: any = useState("short_term");
  const [settings, setSettings]: any = useState(false);
  const [playerOverride, setPlayerOverride]: any = useState(false);
  const [playerOpenOnChange, setPlayerOpenOnChange]: any = useState(true);
  const [topLimit, setTopLimit]: any = useState(5);
  const [notFinalLimit, setNotFinalLimit]: any = useState(5);
  const [artistAnalysis, setArtistAnalysis]: any = useState();
  const [trackAnalysis, setTrackAnalysis]: any = useState();

  const playerStyle = {
    width: `${playerDurationPercent}%`,
  };

  const currentPlayer = (
    player: any,
    playerOverride: boolean,
    playerOpenOnChange: boolean,
  ) => {
    if (!playerOverride) {
      apiFetch("/api/get?get=player", {
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
          if (data?.item?.type === 'track') {
            if (
              player !== undefined &&
              player?.item?.name !== data["item"]["name"] &&
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
          } else { setPlayer(null); }
        }).catch((error: Error) => setError(error.message));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      currentPlayer(player, playerOverride, playerOpenOnChange);
    }, 5000);
    return () => clearInterval(interval);
  }, [player, playerOverride, playerOpenOnChange]);
  {
  }

  useEffect(() => {
    apiFetch("/api/get?get=info", {
      // cache: "force-cache",
    })
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      }).catch((error: Error) => setError(error.message));
    apiFetch(
      `/api/get?get=topTracks&limit=${topLimit}&time_range=${term}&analyze=true`,
      {
        // cache: "force-cache",
        // next : {tags: ["topTracks","sp"]}
        // // next : {revalidate: 10000}
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setTopTracks(data["tracks"]);
        delete data["tracks"];
        setTrackAnalysis(data);
      }).catch((error: Error) => setError(error.message));
    apiFetch(
      `/api/get?get=topArtists&limit=${topLimit}&time_range=${term}&analyze=true`,
      {
        // cache: "force-cache",
        // next : {tags: ["topArtists","sp"]}
        // // next : {revalidate: 10000}
      },
    )
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        setTopArtists(data["artists"]);
        delete data["artists"];
        setArtistAnalysis(data);
      }).catch((error: Error) => setError(error.message));
    currentPlayer(undefined, playerOverride, playerOpenOnChange);
  }, [term, topLimit, playerOverride, playerOpenOnChange]);

  return (
    <main className="overflow-hidden">
      {error && <p role="alert" className="p-4 text-amber-300">{error}</p>}
      <div className="select-none">
        <div className="pt-6 pb-2 px-4 flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                {info?.images?.[0]?.url ? (
                  <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-green-500 to-emerald-400 shadow-md shadow-green-500/20">
                    <Image
                      src={info["images"][0]["url"]}
                      alt="profile pic"
                      className="rounded-full object-cover w-full h-full"
                      width={40}
                      height={40}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-neutral-800 animate-pulse" />
                )}
                <div>
                  <div className="text-xs text-neutral-400 font-medium">Welcome back</div>
                  {info && (
                    <h2 className="text-xl font-bold text-neutral-100">
                      {info["display_name"]}
                    </h2>
                  )}
                </div>
              </div>

              {info && (
                <button
                  onClick={() => {
                    setSettings(!settings);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card glass-card-hover text-sm font-medium text-neutral-300 hover:text-green-400 transition-colors"
                >
                  <i className="bi bi-gear-wide-connected text-base"></i>
                  <span className="hidden sm:inline">Settings</span>
                </button>
              )}
            </div>

            <Transition appear show={settings} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50"
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
                  <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-md transform overflow-hidden  bg-neutral-900/90 rounded-3xl p-6 text-left align-middle shadow-2xl border border-white/10 transition-all">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-bold text-neutral-100 flex items-center gap-2"
                          >
                            Settings
                          </Dialog.Title>
                          {info && (
                            <form action="/api/logout" method="post"><button
                              type="submit"
                              className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium transition-colors"
                            >
                              Logout
                            </button></form>
                          )}
                        </div>

                        <div className="space-y-4 text-sm">
                          {info && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-neutral-400 font-medium">Time Period</span>
                              <select
                                id="top-item-select"
                                className="bg-neutral-800/90 border border-white/10 text-neutral-200 text-xs rounded-xl p-2.5 focus:border-green-500 focus:outline-none cursor-pointer"
                                value={term}
                                onChange={(event) => {
                                  setTerm(event.target.value);
                                }}
                              >
                                <option value="short_term">4 weeks (Recent)</option>
                                <option value="medium_term">6 months</option>
                                <option value="long_term">Several years</option>
                              </select>
                            </div>
                          )}

                          {player && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-neutral-400 font-medium">Show Player</span>
                              <button
                                id="top-item-select"
                                className={`px-4 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                  !playerOverride
                                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                                    : "bg-red-500/20 border-red-500/30 text-red-400"
                                }`}
                                onClick={() => {
                                  setPlayerOverride(!playerOverride);
                                }}
                              >
                                {!playerOverride ? "Enabled" : "Disabled"}
                              </button>
                            </div>
                          )}

                          {(topTracks || topArtists) && (
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <div className="flex items-center justify-between">
                                <label className="text-neutral-400 font-medium">
                                  Items to Display
                                </label>
                                <span className="font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20 text-xs">
                                  {notFinalLimit} items
                                </span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="10"
                                value={notFinalLimit}
                                onChange={(e) => {
                                  setNotFinalLimit(e.target.value);
                                }}
                                onMouseUp={() => {
                                  setTopLimit(notFinalLimit);
                                }}
                                onTouchEnd={() => {
                                  setTopLimit(notFinalLimit);
                                }}
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                          <button
                            type="button"
                            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors"
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
                  "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 xl:grid-rows-1 2xl:grid-rows-1 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-green-700 m-4 gap-y-[6rem]"
                }
              >
                {topArtists ? (
                  topArtists["items"].map((x: any, i: number): any => (
                    <Link
                      href={x["external_urls"]["spotify"]}
                      key={`${i}-top-artist`}
                      target="_blank"
                      className={
                        "grid grid-flow m-2 rows-2 hover:transform  transition-transform hover:scale-105" //hover:transform transition-transform hover:scale-105
                      }
                    >
                      {/*<Transition show={topArtists !== undefined}>*/}
                      <div className={`flex`}>
                        <div className="relative z-0 w-full h-full">
                          <div
                            style={{ lineHeight: 1, fontSize: "7.3rem" }}
                            className={`font-extrabold text-left absolute w-full opacity-70 object-contain select-none blur-[0.px]  hover:blur-0 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-violet-500`}
                          >
                            <p className="font-mono">{i + 1}</p>
                          </div>
                          <div
                            className={`text-green-600 absolute inset-0 ${
                              i < 9 ? "ml-[2.5rem]" : "ml-[3.9rem]"
                            } mt-2 object-contain z-10`}
                          >
                            <div className={"grid w-full "}>
                              <Image
                                className={`${
                                  x <= 4
                                    ? "shadow-green-800 hover:shadow-green-500"
                                    : "shadow-sky-800 hover:shadow-sky-500"
                                } opacity-90 hover:opacity-100 hover:shadowAnimate shadow-[0_35px_120px_-25px_rgba(0,0,0,0.3)]`}
                                src={x["images"][0]["url"]}
                                alt={""}
                                // layout={"fill"}
                                width={128}
                                height={128}
                              />
                            </div>
                            <div className={"text-sm w-3/4 font-extrabold"}>
                              {x["name"]}
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
                  "grid  lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 lg:grid-rows-5 xl:grid-rows-1 2xl:grid-rows-1 sm:grid-flow-col-dense lg:grid-flow-row md:grid-flow-col-dense xl:grid-flow-row 2xl:grid-flow-row outline-red-700 m-4 gap-y-[1rem]"
                }
              >
                {topTracks ? (
                  topTracks["items"].map((x: any, i: number) => (
                    <Link
                      href={x["external_urls"]["spotify"]}
                      key={`${i}-top-songs`}
                      target="_blank"
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
                            <p className="font-mono">{i + 1}</p>
                          </div>
                          <div
                            className={`text-green-600 absolute inset-0 ${
                              i < 9 ? "ml-[3.3rem]" : "ml-[3.9rem]"
                            } mt-2 object-contain z-10`}
                          >
                            <div className={"grid w-full "}>
                              <Image
                                className={`shadow-sky-800 hover:shadow-sky-500 opacity-90 hover:opacity-100  shadow-[0_35px_120px_-25px_rgba(0,0,0,0.3)]`}
                                src={x["album"]["images"][0]["url"]}
                                alt={""}
                                width={128}
                                height={128}
                              />
                            </div>
                            <div className={"text-md w-3/4 font-extrabold"}>
                              {x["name"]}
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
          </div>
          {artistAnalysis && artistAnalysis["genres"] && (
        <div className="max-w-xl mx-auto my-12 glass-card rounded-3xl p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-neutral-100">Genre Breakdown</h3>
          </div>
          <div style={{ height: 320, width: "100%" }}>
            <ResponsivePie
              data={artistAnalysis["genres"]}
              margin={{ top: 30, right: 60, bottom: 60, left: 60 }}
              innerRadius={0.6}
              activeOuterRadiusOffset={8}
              colors={{ scheme: "set1" }}
              borderWidth={2}
              borderColor={{
                from: "color",
                modifiers: [["darker", 1]],
              }}
              arcLinkLabelsOffset={-11}
              arcLinkLabelsTextColor="#d6d1d1"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={17}
              isInteractive={true}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
            />
          </div>
        </div>
      )}
      {player && !playerOverride && (
        <Player
          player={player}
          setPlayerOpen={setPlayerOpen}
          playerOverride={playerOverride}
          playerOpen={playerOpen}
          playerDurationPercent={playerDurationPercent}
        />
      )}
    </main>
  );
}
