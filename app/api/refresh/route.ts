// import {revalidateTag} from "next/cache";
// import querystring from "querystring";
// import {redirect} from "next/navigation";
// import {cookies} from "next/headers";
// import {NextResponse} from "next/server";
//
// const client_id = "REDACTED_CONFIGURATION";
// const client_secret = "REDACTED_CONFIGURATION"
//
// export async function GET(request:any) {
//     const cookie = cookies();
//     let refresh_token:any = cookie.get("refresh_token");
//     if (refresh_token === undefined){
//         return NextResponse.json({error:"Undefined refresh token",code:402})
//     }
//     const payload = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: new URLSearchParams({
//         grant_type: 'refresh_token',
//         refresh_token: refresh_token,
//         client_id: client_id
//       }),
//     }
//
//     const body = await fetch("https://accounts.spotify.com/api/token", payload);
//     const data = await body.json();
//     console.log(body)
//
//     cookie.set("access_token",data["access_token"])
//     cookie.set("refresh_token",data["refresh_token"])
//     revalidateTag("sp")
//     return NextResponse.json("ok")
//
// }