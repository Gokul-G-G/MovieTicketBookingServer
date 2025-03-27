import { qrCodeGenerator } from "../utils/qrCodeGenerator.js"; // Utility to generate QR codes
import { Booking } from "../models/bookingsModel.js";
import { Show } from "../models/showsModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import { User } from "../models/userModel.js";

export const bookShow = async (req, res) => {
  try {
    // Extract user ID from authentication middleware
    const userId = req.user.id;
    const { showId, theaterId, selectedSeats, seatType ,date , timeSlot} = req.body;
    console.log("Incoming Booking Request:", req.body);
    console.log("Authenticated User ID:", req.user.id);


    // Validate input
    if (
      !showId ||
      !theaterId ||
      !selectedSeats ||
      !seatType ||
      selectedSeats.length === 0
    ) {
      return res.status(400).json({ error: "Invalid booking details" });
    }

    // Find the show
    const show = await Show.findById(req.body.showId);
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }

    // Find the seats in the theater's seat configuration
    const theater = await TheaterOwner.findById(req.body.theaterId);;
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    //Check if selected seats are already booked
    let isAnySeatBooked = false;
    theater.seatConfiguration.forEach((seatCategory) => {
      if (seatCategory.seatType.toLowerCase() === seatType.toLowerCase()) {
        seatCategory.rows.forEach((row) => {
          row.seats.forEach((seat) => {
            if (selectedSeats.includes(seat.seatLabel) && seat.isBooked) {
              isAnySeatBooked = true; // If any seat is already booked, flag it
            }
          });
        });
      }
    });
    if (isAnySeatBooked) {
      return res
        .status(400)
        .json({ message: "selected seats are already booked" });
    }

    // Flatten all seats into one array
    const allSeats = theater.seatConfiguration.flatMap((seatType) =>
      seatType.rows.flatMap((row) =>
        row.seats.map((col) => ({
          seatLabel: `${col.seatLabel}`, // Construct seat label like "H1"
          price: seatType.price, // Get seat price
          isBooked: col.isBooked === true, // set the seat booked
          seatType: seatType.seatType,
        }))
      )
    );

    // Filter by type
    const filteredSeats = allSeats.filter(
      (seat) => seat.seatType.toLowerCase() === req.body.seatType.toLowerCase()
    );
    // Get selected seat details
    const selectedSeatDetails = filteredSeats.filter((seat) =>
      req.body.selectedSeats.includes(seat.seatLabel)
    );

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

    // Create booking entry
    const newBooking = new Booking({
      user: userId,
      show: showId,
      theater: theaterId,
      seats: selectedSeatDetails,
      totalAmount: totalPrice,
      paymentStatus: "Pending", // Payment integration can update this
    });

    // Generate QR code for booking
    newBooking.qrCode = await qrCodeGenerator(newBooking._id.toString());

    // Save booking to database
    await newBooking.save();

    //Update isBooked in TheaterOwner Schema
    theater.seatConfiguration.forEach((seatCategory) => {
      if (seatCategory.seatType.toLowerCase() === seatType.toLowerCase()) {
        seatCategory.rows.forEach((row) => {
          row.seats.forEach((seat) => {
            if (selectedSeats.includes(seat.seatLabel)) {
              seat.isBooked = true; // Mark as booked
            }
          });
        });
      }
    });

    // Save the updated theater document
    await theater.save();

    res.status(201).json({
      message: "Booking successful!",
      booking: newBooking,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
