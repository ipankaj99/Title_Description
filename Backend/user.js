import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const server= async()=>
{
    try{
       await mongoose.connect(process.env.MONGO_URL);
       console.log("connected successfully");
    }
    catch(err)
    {
          console.log("problem while connceting to database"+err.message);
    }
}

const  userSchema= new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
        },
        email:{
            type:String, 
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        posts:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'postModel',
            }
        ],
        profilePic:String,
    }
)

const userModel=mongoose.model('userModel', userSchema);
export  {server, userModel}