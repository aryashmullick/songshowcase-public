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
import Player from "@/Components/player";
// import WavesSVG from "@/public/layered-waves-haikei (1).svg"

const blanka = localFont({
  src: "../../public/Blanka.otf",
  display: "swap",
  variable: "--font-blanka",
});

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
  const [page, changePage]: any = useState("dash");
  const [topLimit, setTopLimit]: any = useState(5);
  const [notFinalLimit, setNotFinalLimit]: any = useState(5);

  const playerStyle = {
    width: `${playerDurationPercent}%`,
  };

  const currentPlayer = (
    player: any,
    playerOverride: boolean,
    playerOpenOnChange: boolean,
  ) => {
    if (!playerOverride) {
      fetch("/api/get?get=player", {
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
      currentPlayer(player, playerOverride, playerOpenOnChange);
    }, 5000);
    return () => clearInterval(interval);
  }, [cookie, player, playerOverride, playerOpenOnChange]);
  {
  }

  useEffect(() => {
    fetch("/api/get?get=info", {
      // cache: "force-cache",
    })
      .then((res) => res.json())
      .then((data) => {
        setInfo(data);
      });
    fetch(`/api/get?get=topTracks&limit=${topLimit}&time_range=${term}`, {
      // cache: "force-cache",
      // next : {tags: ["topTracks","sp"]}
      // // next : {revalidate: 10000}
    })
      .then((res) => res.json())
      .then((data) => {
        setTopTracks(data);
      });
    fetch(`/api/get?get=topArtists&limit=${topLimit}&time_range=${term}`, {
      // cache: "force-cache",
      // next : {tags: ["topArtists","sp"]}
      // // next : {revalidate: 10000}
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data)
        setTopArtists(data);
        console.log("data", data["items"]);
      });
    currentPlayer(undefined, playerOverride, playerOpenOnChange);
  }, [term, topLimit]);

  return (
    <main className="">
      <div></div>
      <div className={""}>
        
        {page === "dash" && (
          <div className={"select-none "}>
            <div className="">
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
                      Hello{" "}
                      <span className={"font-bold"}>
                        {info["display_name"]}
                      </span>
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
                          <div
                            className={"grid grid-flow-row gap-4 select-none"}
                          >
                            <table className={"[&_td]:p-2"}>
                              {info && (
                                <tr>
                                  <td>
                                    <div className={"text-gray-400"}>
                                      Time Period
                                    </div>
                                  </td>
                                  <td>
                                    <select
                                      id={"top-item-select"}
                                      className="border outline-green-900 outline focus:outline-dashed  text-sm rounded-lg block w-full p-2.5 bg-neutral-950 border-gray-600 placeholder-gray-400 text-white "
                                      value={term}
                                      onChange={(event) => {
                                        setTerm(event.target.value);
                                      }}
                                    >
                                      <option value={"short_term"}>
                                        4 weeks
                                      </option>
                                      <option value="medium_term">
                                        6 months
                                      </option>
                                      <option value="long_term">
                                        Several years
                                      </option>
                                    </select>
                                  </td>
                                </tr>
                              )}

                              {player && (
                                <tr>
                                  <td>
                                    <div className={"text-gray-400"}>
                                      Show player?
                                    </div>
                                  </td>
                                  <td>
                                    <button
                                      id={"top-item-select"}
                                      className={`border ${
                                        !playerOverride
                                          ? "outline-green-900"
                                          : "outline-red-900"
                                      } outline hover:outline-dashed text-sm rounded-lg block w-full p-1 bg-neutral-950 border-gray-600 placeholder-gray-400 text-white `}
                                      onClick={() => {
                                        setPlayerOverride(!playerOverride);
                                      }}
                                    >
                                      {!playerOverride ? "Yes" : "No"}
                                    </button>
                                  </td>
                                </tr>
                              )}

                              {(topTracks || topArtists) && (
                                <tr>
                                  <td>
                                    <label className={" text-gray-300/70"}>
                                      Number of top artists:{" "}
                                      <b className="text-green-500">
                                        {notFinalLimit}
                                      </b>
                                    </label>
                                  </td>
                                  <td>
                                    <div>
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
                                        className={"mt-2 w-full"}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </table>
                          </div>

                          <div></div>
                          <div></div>
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
                              className={`font-extrabold text-left absolute w-full text-9xl opacity-70 object-contain select-none blur-[0.px]  hover:blur-0 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-violet-500`}
                            >
                              <p className={blanka.className}>{i + 1}</p>
                            </div>
                            <div
                              className={`text-green-600 absolute inset-0 ${
                                i < 9 ? "ml-[3.3rem]" : "ml-[3.9rem]"
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
                              <p className={blanka.className}>{i + 1}</p>
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
              <br />
              <br />
              <br />
              <br />
              <br />
            </div>
          </div>
        )}
      </div>
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
