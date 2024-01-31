'use client';
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useCookies } from "react-cookie";


export default function Home() {

  const [cookie,setCookie] = useCookies(["session_id","sp_id"])

  useEffect(()=>{
    if (cookie.session_id!==undefined && cookie.sp_id!==undefined){
      redirect("/dash")
    }
  },[cookie])

  return (
    <main>
      <div
        className={
          "place-items-center text-center w-screen grid top-[40vh] absolute "
        }
      >
        <div className={"text-3xl font-extrabold font-serif text-green-700 "}>
          SongShowcase
        </div>
        <div className={"text-green-600 shadow-green-500  "}>
          View and showcase your Spotify songs and data in a single click
        </div>
        <br />
        <div>
          <Link
            href={"/api/login"}
            className={
              "outline p-2 rounded-md hover:bg-green-700 shadow-green-300 shadow-2xl hover:shadow-green-600  outline-green-700"
            }
          >
            Log in with Spotify
          </Link>
        </div>
      </div>
    </main>
  );
}
