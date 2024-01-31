import {revalidateTag} from "next/cache";
import querystring from "querystring";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import {NextRequest, NextResponse} from "next/server";
import UserSession from "@/Models/UserSession";
import connectDB from "@/app/lib/connectDB";
const client_id = process.env.SP_CLIENT_ID
const client_secret = process.env.SP_CLIENT_SECRET

const url = "https://accounts.spotify.com/api/token"
async function getToken(refresh_token:string | null){
    const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // @ts-ignore
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
         //@ts-ignore
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
          client_id: client_id
        }),
      }
      const body = await fetch(url, payload);
      return await body.json();
}



export async function GET(req: NextRequest, res: NextResponse) {
  await connectDB()
  const cookie = cookies();
  let session: any = cookie.get("session_id");
  let id:any = cookie.get("sp_id");

  if (!session || !id) {
    console.log("session not verified")
    return NextResponse.json({ error: "Could not verify session" }, { status: 400 });
  }

  const user:any = await UserSession.findOne({
    session_id: session.value,
    sp_id: id.value,
  },"sp_access_token sp_refresh_token").exec();

  const old_rt = user["sp_refresh_token"]

  if(!old_rt){
    return redirect("/")
  }

  const t_data = await getToken(old_rt)

  console.log("reached")
  const update_token = await UserSession.findOneAndUpdate({
    session_id: session.value,
    sp_id: id.value,
  },{
    sp_access_token: t_data["access_token"],
    sp_refresh_token: t_data["refresh_token"],
  }).exec()

  return NextResponse.json({"message":"ok"},{"status":200})
}