import mongoose from "mongoose";

const UserInfo = mongoose.Schema({
    sp_id: {type:String,required:true,unique:true},
    sp_data: {type:Object,required:true}
},{timestamps:true,collection:"UserInfo"})


export default mongoose.models.UserInfo || mongoose.model("UserInfo",UserInfo)
