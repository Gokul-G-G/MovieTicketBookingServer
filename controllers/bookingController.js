
 import { qrCodeGenerator } from "../utils/qrCodeGenerator.js";// Utility to generate QR codes

import { Booking } from "../models/bookingsModel.js";
import { Show } from "../models/showsModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import { User } from "../models/userModel.js";


// Book a show
export const bookShow = async (req, res) => {
  try {
    const userId  = req.user.id; // Extract user ID from authentication middleware
    const { showId, theaterId, selectedSeats,seatType } = req.body;
    console.log("SHOW ID = ",showId)
    console.log("THEATER ID = ",theaterId)
    console.log("SELECTED SEAT = ",selectedSeats)

    // Validate input
    if (!showId || !theaterId || !selectedSeats || !seatType || selectedSeats.length === 0) {
      return res.status(400).json({ error: "Invalid booking details" });
    }

    const show = await Show.findById(req.body.showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // Find the seats in the theater's seat configuration
    const theater = await TheaterOwner.findById(req.body.theaterId);
    console.log("THEATER OWNER :::",theater)
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    // Flatten all seats into one array
    const allSeats = theater.seatConfiguration.flatMap((seatType) =>
      seatType.rows.flatMap((row) =>
        row.seats.map((col) => ({
          seatLabel: `${col.seatLabel}`, // Construct seat label like "H1"
          price: seatType.price, // Get seat price
          seatType: seatType.seatType,
        }))
      )
    );

    // Filter by type
    const filteredSeats = allSeats.filter((seat) => seat.seatType.toLowerCase() === req.body.seatType.toLowerCase());

    console.log("Filtered seat", filteredSeats);
    // Get selected seat details
    const selectedSeatDetails = filteredSeats.filter((seat) =>
      req.body.selectedSeats.includes(seat.seatLabel)
    );
    console.log("SELECETED SEAT :::",selectedSeatDetails)
    
    // Ensure we have valid seat details
    if (selectedSeatDetails.length !== req.body.selectedSeats.length) {
      return res
        .status(400)
        .json({ message: "Some seats are invalid or unavailable" });
    }

    // Now calculate the total price
    const totalPrice = selectedSeatDetails.reduce(
      (acc, seat) => acc + seat.price,
      0
    );
    console.log("Total Price:", totalPrice);


    // Create booking entry
    const newBooking = new Booking({
      user: userId,
      show: showId,
      theater: theaterId,
      seats: selectedSeatDetails,
      totalAmount:totalPrice,
      paymentStatus: "Pending", // Payment integration can update this
    });

    // Generate QR code for booking
    newBooking.qrCode = await qrCodeGenerator(newBooking._id.toString());

    // Save booking to database
    await newBooking.save();

    res.status(201).json({
      message: "Booking successful!",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
