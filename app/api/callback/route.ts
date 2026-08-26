import {redirect} from "next/navigation";
import * as querystring from "querystring";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import connectDB from "@/app/lib/connectDB";
import UserSession from "@/Models/UserSession"
import { v4 as uuid } from 'uuid';
import  UserInfo  from "@/Models/UserInfo";



const client_id = process.env.SP_CLIENT_ID
const client_secret = process.env.SP_CLIENT_SECRET
const url = "https://accounts.spotify.com/api/token"
export const dynamic = "force-dynamic"
async function getData(code:string | null){
  return await fetch(url,
    {
        method: "POST",
        // @ts-ignore
        body: querystring.stringify({
          code: code,
          redirect_uri: "http://127.0.0.1:3000/api/callback",
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
    }
  })
      .then((response) => {
        console.log(response.status)
        return response.json()
      })
}


export async function GET(req: NextRequest, res: NextResponse) {
  await connectDB()
  const { searchParams } = new URL(req.url);
  let state = searchParams.get("state");
  let code = searchParams.get("code");

  let sp_data = await getData(code);
  console.log("sp_data",sp_data)
  let sp_user_info = await getInfo(sp_data["access_token"])
  console.log(sp_user_info)
  let cookie = cookies()
  const sessionID = uuid()

  // registering to db
  const session = new UserSession({
    sp_id: sp_user_info["id"],
    sp_access_token: sp_data["access_token"],
    sp_refresh_token: sp_data["refresh_token"],
    session_id: sessionID,
  })

  const u_find = await UserInfo.findOneAndUpdate({sp_id:sp_user_info["id"]},{sp_data:sp_user_info}).exec();
  if (!u_find){
      const user = new UserInfo({
        sp_id: sp_user_info["id"],
        sp_data: sp_user_info,
      })
      await user.save()
  }

  await session.save()

  cookie.set("sp_id",sp_user_info["id"])
  cookie.set("session_id",sessionID)


  return redirect("/dash");

}

