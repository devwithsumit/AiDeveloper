import mongoose from "mongoose";

const dbConnect = ()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB connected ✅");
    }).catch((err)=>{
        console.log("Mongo connection failed ❗️", err);
    })
}

export default dbConnect;