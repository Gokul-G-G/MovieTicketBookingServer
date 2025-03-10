import mongoose, { Schema } from "mongoose";

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
    screen: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlots: [
      {
        time: { type: String, required: true },
        seats: [
          {
            seatType: {
              type: String,
              enum: ["Silver", "Gold", "Platinum"],
              required: true,
            },
            totalSeats: { type: Number, required: true }, // From TheaterOwner model
            price: { type: Number, required: true }, // From TheaterOwner model
            bookedSeats: [{ type: Number }], // Array to track booked seats
          },
        ],
      },
    ],
    totalSeats: { type: Number, required: true }, // Computed from seatConfig in TheaterOwner model
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

export const Show = mongoose.model("Show", showSchema);
