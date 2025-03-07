import mongoose,{Schema} from 'mongoose'
import generateProfilePic from '../utils/profilePicGenerator.js';

const userSchema = new Schema(
    {
        name: {
            type:String,
            required:true,
            maxLength:30,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            maxLength:30,
            trim:true,
            lowercase:true,
        },
        phone:{
            type:String,
            required:true,
            maxLength:10,
            trim:true,
        },
        password:{
            type:String,
            required:true,
            minLength:8,
        },
        role:{
            type:String,
            required:true,
            enum:['user'],
            default:'user',
        },
        profilePic:{
            type:String,
        },
        isActive:{
            type:Boolean,
            default:true,
        },
    },
    {
        timestamps:true
    }
);

// Generate profile picture before saving
userSchema.pre("save", function (next){
  if (!this.profilePic) {
    this.profilePic = generateProfilePic(this.name);
  }
  next();
});

export const User = mongoose.model("User", userSchema);