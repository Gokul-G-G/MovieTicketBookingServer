import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who booked the ticket
    show: { type: Schema.Types.ObjectId, ref: "Show", required: true }, // Show ID
    theater: {
      type: Schema.Types.ObjectId,
      ref: "TheaterOwner",
      required: true,
    }, // Theater ID
    seats: [
      {
        seatLabel: { type: String, required: true }, // e.g., H1, H2, G3
        seatType: {
          type: String,
          enum: ["Silver", "Gold", "Platinum"],
          required: true,
        },
        price: { type: Number, required: true }, // Price per seat
      },
    ],
    totalAmount: { type: Number, required: true }, // Total price of booking
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    bookingTime: { type: Date, default: Date.now }, // Timestamp of booking
    qrCode: { type: String }, // Store QR code URL (Generated dynamically)
  },
  { timestamps: true }
);

export const Booking = model("Booking", bookingSchema);
