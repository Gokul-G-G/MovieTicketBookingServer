import { Schema, model } from "mongoose";
import generateProfilePic from "../utils/profilePicGenerator.js";

const theaterOwnerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: "theaterOwner" },
    profilePic: { type: String }, // Profile picture field
  },
  { timestamps: true }
);

// Middleware to generate a profile picture based on the theater owner's name
theaterOwnerSchema.pre("save", function (next) {
  if (!this.profilePic) {
    this.profilePic = generateProfilePic(this.name);
  }
  next();
});

export const TheaterOwner = model("TheaterOwner", theaterOwnerSchema);
