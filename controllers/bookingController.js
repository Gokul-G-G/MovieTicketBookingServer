import { qrCodeGenerator } from "../utils/qrCodeGenerator.js"; // Utility to generate QR codes
import { Booking } from "../models/bookingsModel.js";
import { Show } from "../models/showsModel.js";
import { TheaterOwner } from "../models/theaterModel.js";


export const bookShow = async (req, res) => {
  try {
    const userId = req.user.id;
    const { showId, theaterId, selectedSeats, seatType, date, timeSlot } =
      req.body;
// console.log("Recieved data",req.body)
    if (
      !showId ||
      !theaterId ||
      !selectedSeats ||
      !seatType ||
      !date ||
      !timeSlot
    ) {
      return res.status(400).json({ error: "Invalid booking details" });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const theater = await TheaterOwner.findById(theaterId);
    if (!theater) return res.status(404).json({ message: "Theater not found" });

    const formattedDate = new Date(date).toISOString().split("T")[0];

    const selectedDate = show.dates.find((d) => {
      return new Date(d.date).toISOString().split("T")[0] === formattedDate;
    });

    if (!selectedDate) return res.status(400).json({ message: "Invalid date" });

    const selectedTimeSlot = selectedDate.timeSlots.find(
      (slot) => slot.time === timeSlot
    );
    if (!selectedTimeSlot)
      return res.status(400).json({ message: "Invalid time slot" });

    let isAnySeatBooked = false;
    let seatsToBook = [];
// console.log("SelectedTime Slot",selectedTimeSlot.seatTypes[0].rows[0].seats)
// console.log("TimeSlot===",selectedTimeSlot)
    selectedTimeSlot.seatTypes.forEach((type) => {
      // console.log("Seat Type==",type)
      type.rows.forEach((seats) => {
        // console.log("Seats===",seats)
        seats.seats.forEach((seat)=>{
          const seatToBook = selectedSeats.find(
            (s) => s.seatId === seat._id.toString()
          );
            if (seatToBook) {
            if (seat.isBooked) {
              isAnySeatBooked = true;
            } else {
              seatsToBook.push({
                seatId: seat._id,
                seatLabel: seat.seatLabel,
                seatType,
                price: seat.price,
              });
              seat.isBooked = true; // Mark seat as booked
            }
}
        })
        
      });
    });

    if (isAnySeatBooked) {
      return res
        .status(400)
        .json({ message: "One or more selected seats are already booked" });
    }

    // ✅ Calculate total price correctly
    // console.log("Seats to Book",seatsToBook)
    const totalPrice = seatsToBook.reduce((acc, seat) => acc + seat.price, 0);
    // console.log("Total Amount",totalPrice)
    if (isNaN(totalPrice) || totalPrice <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid total amount calculation" });
    }

    // ✅ Create booking entry
    const newBooking = new Booking({
      user: userId,
      show: showId,
      theater: theaterId,
      seats: seatsToBook, // Now passing correctly formatted seat objects
      totalAmount: totalPrice,
      paymentStatus: "Pending",
      showDate: formattedDate, // ✅ Store show date
      showTime: timeSlot,
    });

    // ✅ Generate QR Code
    newBooking.qrCode = await qrCodeGenerator(newBooking._id.toString());

    // ✅ Save booking & update show
    await newBooking.save();
    await show.save();

    res
      .status(201)
      .json({ message: "Booking successful!", booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getBookingDetails = async (req,res)=>{
  try {
      const booking = await Booking.findById(req.params.id).populate({
        path: "show",
        populate: [
          { path: "movieId", select: "title language posterImage" }, // Fetch movie details
          { path: "theaterId", select: "name location" }, // Fetch theater details
        ],
      });
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }
      res.status(200).json({ success: true, booking });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
}

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log("User Id==", userId);

    // Find all bookings of the logged-in user
    const bookings = await Booking.find({ user: userId }) // Fixed find() query
      .populate({
        path: "show",
        populate: [
          { path: "movieId", select: "title" }, // Fetch movie title
          { path: "theaterId", select: "name location" }, // Fetch theater details
        ],
      })
      .exec();

    // console.log("Bookings==", bookings);

    if (!bookings.length) {
      return res
        .status(404)
        .json({ success: false, message: "No bookings found" });
    }

    // Format response
    const formattedBookings = bookings.map((booking) => ({
      _id: booking._id,
      movieName: booking.show.movieId.title, // Fixed field reference
      theaterName: booking.show.theaterId.name, // Fixed field reference
      theaterLocation: booking.show.theaterId.location, // Added location
      showDate: booking.showDate,
      showTime: booking.showTime,
      seats: booking.seats, // Fixed key from "selectedSeats"
      totalAmount: booking.totalAmount, // Added total amount
      paymentStatus: booking.paymentStatus, // Added payment status
      qrCode: booking.qrCode, // Added QR Code
      status: booking.status, // "Confirmed" or "Cancelled"
    }));

    res.status(200).json({ success: true, data: formattedBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};