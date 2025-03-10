const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie", // References Movie model
      required: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TheaterOwner", // References TheaterOwner model
      required: true,
    },
    screen: {
      type: String, // Stores screen number (e.g., "Screen 1", "IMAX Screen")
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: [
      {
        time: { type: String, required: true }, // Time slot (e.g., "02:30 PM")
        seats: [
          {
            seatType: {
              type: String,
              enum: ["Silver", "Gold", "Platinum"],
              required: true,
            },
            price: {
              type: Number,
              required: true,
            },
            rows: [
              {
                rowLabel: { type: String, required: true }, // Row name (H, G, F, etc.)
                columns: [
                  {
                    columnLabel: { type: String, required: true },
                    seat: [
                      {
                        seatNumber: { type: Number, required: true }, // Unique seat ID
                        isBooked: { type: Boolean, default: false }, // Seat availability
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", showSchema);
