import { Schema, model } from "mongoose";
import generateProfilePic from "../utils/profilePicGenerator.js";

const seatSchema = new Schema({
  seatId: { type: Schema.Types.ObjectId, auto: true }, // Unique seat ID
  seatLabel: { type: String, required: true }, // e.g., H1, H2, G3
  isBooked: { type: Boolean, default: false }, // Booking status
});

const rowSchema = new Schema({
  rowLabel: { type: String, required: true }, // e.g., H, G, F
  seats: [seatSchema], // Each row contains multiple seats
});

const seatTypeSchema = new Schema({
  seatType: {
    type: String,
    enum: ["Silver", "Gold", "Platinum"],
    required: true,
  },
  totalSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  rows: [rowSchema], // Each seat type has multiple rows
});

const theaterOwnerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    password: { type: String, required: true },
    seatConfiguration: [seatTypeSchema], // Fetch seat configuration dynamically
    isVerified: { type: Boolean, default: false },
    isActive: {type: Boolean,default: true,},
    role: { type: String, default: "theaterOwner" },
    profilePic: { type: String }, // Added profilePic field
  },
  { timestamps: true }
);

// middleware for generating profilePic
theaterOwnerSchema.pre("save", function (next) {
  if (!this.profilePic) {
    this.profilePic = generateProfilePic(this.name);
  }
  next();
});

export const TheaterOwner = model("TheaterOwner", theaterOwnerSchema);
