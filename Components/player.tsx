import Image from 'next/image'
import Link from "next/link";
import { Transition } from '@headlessui/react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import Marquee from 'react-fast-marquee';

export default function Player({player,setPlayerOpen,playerOverride,playerOpen,playerDurationPercent}:any) {
  return (
    <>
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
          value={player!==undefined && !playerOverride && playerDurationPercent}
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
            src={player!==undefined &&
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
      {/*{player!==undefined && playerOpen && (*/}
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
            <div>{player!==undefined && !playerOverride && player["item"]["name"]}</div>
          )}
        </span>{" "}
        {player!==undefined && !playerOverride && player["item"]["explicit"] && (
          <i className="bi bi-explicit-fill text-sm"></i>
        )}{" "}
        &#183;{" "}
        <span className={"text-sm"}>
          {player!==undefined &&
            !playerOverride &&
            player["item"]["artists"][0]["name"]}
        </span>
        {/*</div>*/}
      </Transition>
      {/*)}*/}
    </div>
    </>
  )}


