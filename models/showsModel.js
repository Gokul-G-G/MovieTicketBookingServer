import mongoose, { Schema } from "mongoose";

// Seat Schema - Represents an individual seat (NOW INCLUDES PRICE)
const seatSchema = new Schema({
  seatLabel: { type: String, required: true }, // e.g., H1, H2, G3
  isBooked: { type: Boolean, default: false }, // Booking status
  price: { type: Number, required: true }, // ✅ Price is now in seatSchema
});

// Row Schema - Represents a row containing multiple seats
const rowSchema = new Schema({
  rowLabel: { type: String, required: true }, // e.g., H, G, F
  seats: [seatSchema], // List of seats in the row
});

// Seat Type Schema - Defines categories like Silver, Gold, Platinum
const seatTypeSchema = new Schema({
  seatType: {
    type: String,
    enum: ["Silver", "Gold", "Platinum"],
    required: true,
  },
  rows: [rowSchema], // Rows containing seats
});

// Time Slot Schema - Each date has multiple time slots
const timeSlotSchema = new Schema({
  time: { type: String, required: true }, // e.g., "10:00 AM"
  seatTypes: [seatTypeSchema], // Each time slot has different seat categories
});

// Date Schema - Each show has multiple dates
const dateSchema = new Schema({
  date: { type: Date, required: true }, // Show date
  timeSlots: [timeSlotSchema], // Each date has multiple time slots
});

// Show Schema - Represents a movie show
const showSchema = new Schema(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theaterId: {
      type: Schema.Types.ObjectId,
      ref: "TheaterOwner",
      required: true,
    },
    screen: { type: String, required: true }, // Screen info
    dates: [dateSchema], // Each show has multiple dates
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

export const Show = mongoose.model("Show", showSchema);
