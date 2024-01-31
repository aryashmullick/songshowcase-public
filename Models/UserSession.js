import mongoose from "mongoose";

const UserSession = mongoose.Schema({
    sp_id: {type:String,required:true},
    sp_access_token: {type:String,required:true},
    sp_refresh_token: {type:String,required:true},
    session_id: {type:String,unique:true,required:true},
},
{timestamps:true,collection:"UserSession"})

export default mongoose.models.UserSession || mongoose.model("UserSession",UserSession)

