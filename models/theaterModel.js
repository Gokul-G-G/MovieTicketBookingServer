import mongoose, { Schema } from "mongoose";
import generateProfilePic from "../utils/profilePicGenerator.js";
const theaterOwnerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      maxLength: 10,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    acType: {
      type: String,
      enum: ["A/C", "Non A/C"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    profilePic:{
      type:String,
    },
    role: {
      type: String,
      enum: ["theaterOwner"],
      default: "theaterOwner",
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin can verify the theater owner later
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate profile picture before saving
theaterOwnerSchema.pre("save", function (next){
  if (!this.profilePic) {
    this.profilePic = generateProfilePic(this.name);
  }
  next();
});

export const TheaterOwner = mongoose.model("TheaterOwner", theaterOwnerSchema);
