import mongoose from 'mongoose';


const postSchema= new mongoose.Schema(
    {
        title:{
            type:String, 
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'userModel'
        }
    }

)

const postModel = mongoose.model('postModel', postSchema);

export default postModel;