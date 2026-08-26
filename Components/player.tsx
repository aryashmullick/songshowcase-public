import Image from 'next/image'
import Link from "next/link";
import { Transition } from '@headlessui/react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import Marquee from 'react-fast-marquee';

export default function Player({player,setPlayerOpen,playerOverride,playerOpen,playerDurationPercent}:any) {
  return (
    <>
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 p-1.5  rounded-full bg-neutral-950/85 backdrop-blur-xl border transition-all duration-300 shadow-2xl cursor-pointer select-none ${
        player["is_playing"]
          ? "border-green-500/40 shadow-green-500/10 hover:border-green-500/70"
          : "border-neutral-800 hover:border-neutral-700"
      }`}
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
      <div className="relative flex h-11 w-11 justify-center items-center shrink-0">
        <CircularProgressbarWithChildren
          value={player!==undefined && !playerOverride && playerDurationPercent}
          styles={buildStyles({
            trailColor: "rgba(255,255,255,0.06)",
            pathColor: `${
              player && !playerOverride && player["is_playing"]
                ? `rgb(34, 197, 94)`
                : `rgba(239, 68, 68, 0.7)`
            }`,
          })}
        >
          {player?.item?.album?.images?.[0]?.url && (
            <Image
              src={player["item"]["album"]["images"][0]["url"]}
              alt={"Song pic"}
              width={40}
              height={40}
              className={"rounded-full z-40 p-0.5 object-cover"}
            />
          )}
          <Transition
            show={!player["is_playing"]}
            enter="transition-all duration-300"
            enterFrom="scale-105 opacity-0"
            enterTo="scale-100 opacity-100"
            leave={"transition-all duration-200"}
            leaveFrom="scale-90 opacity-100"
            leaveTo="scale-0 opacity-0"
            className={"absolute z-50 p-1 rounded-full bg-black/60 text-white"}
          >
            <i className={"bi bi-pause-fill text-sm"}></i>
          </Transition>
        </CircularProgressbarWithChildren>
      </div>

      <Transition
        show={playerOpen}
        enter="transition-all duration-300"
        enterFrom="max-w-0 opacity-0"
        enterTo="max-w-[320px] opacity-100"
        leave={"transition-all duration-200"}
        leaveFrom="max-w-[320px] opacity-100"
        leaveTo="max-w-0 opacity-0"
        className="overflow-hidden flex items-center gap-2 text-sm whitespace-nowrap"
      >
        <span className="font-semibold text-neutral-100">
          {player["item"]["name"].length > 20 ? (
            <div className="w-[180px]">
              <Marquee pauseOnHover={true} delay={1} className="rounded-full">
                {player["item"]["name"]}&nbsp;&bull;&nbsp;
              </Marquee>
            </div>
          ) : (
            <span>{player!==undefined && !playerOverride && player["item"]["name"]}</span>
          )}
        </span>
        {player!==undefined && !playerOverride && player["item"]["explicit"] && (
          <span className="text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold px-1 rounded">E</span>
        )}
        <span className="text-neutral-500">&bull;</span>
        <span className="text-xs text-neutral-400 truncate">
          {player!==undefined &&
            !playerOverride &&
            player["item"]["artists"][0]["name"]}
        </span>
      </Transition>
    </div>
    </>
  );
}
