import mongoose from 'mongoose';

const connectDB  = async()=>{
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("MongoDB connected successfully");
    }).catch((err)=>{
        console.log("mongo db connection error",err)
    })
}

export default connectDB;