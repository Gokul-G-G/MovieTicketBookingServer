import { Booking } from "../models/bookingsModel.js";
import { Movie } from "../models/movieModel.js";
import { Show } from "../models/showsModel.js";
import { TheaterOwner } from "../models/theaterModel.js";

/*==========
  CREATE SHOW
============ */
export const addShow = async (req, res) => {
  try {
    const { movieId, screen, date, timeSlots } = req.body;

    // Validate required fields
    if (!movieId || !screen || !date || !timeSlots || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    // Ensure that the user is a theater owner
    if (req.user.role !== "theaterOwner") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only theater owners can add shows.",
      });
    }

    // Fetch the theater owner's seat configuration
    const theaterOwner = await TheaterOwner.findById(req.user._id);
    if (!theaterOwner) {
      return res.status(403).json({
        success: false,
        message: "Theater owner not found.",
      });
    }

    if (!theaterOwner.seatConfiguration || theaterOwner.seatConfiguration.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Theater owner must have a seat configuration.",
      });
    }

    // Map over timeSlots and generate seats dynamically based on theater owner's seatConfig
    const formattedTimeSlots = timeSlots.map((slot) => ({
      time: slot,
      seats: theaterOwner.seatConfiguration.map((seat) => ({
        seatType: seat.seatType,
        totalSeats: seat.totalSeats,
        price: seat.price,
        bookedSeats: [],
      })),
    }));

    // Compute total seats
    const totalSeats = theaterOwner.seatConfiguration.reduce(
      (acc, seat) => acc + seat.totalSeats,
      0
    );

    // Create a new show
    const newShow = new Show({
      movieId,
      theaterId: req.user._id,
      screen,
      date,
      timeSlots: formattedTimeSlots,
      totalSeats,
      status: "Scheduled",
    });

    // Save to database
    await newShow.save();

    res.status(201).json({
      success: true,
      message: "Show added successfully!",
      show: newShow,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/*==========
  EDIT SHOW
============ */
export const editShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const { screen, date, timeSlots } = req.body;

    // Validate required fields
    if (!showId || !screen || !date || !timeSlots || timeSlots.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Validate date format
    if (isNaN(Date.parse(date))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format." });
    }

    // Find the show
    const show = await Show.findById(showId);
    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Show not found." });
    }

    // Ensure the user is the owner of the show
    if (req.user._id.toString() !== show.theaterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied! You can only edit your own shows.",
      });
    }

    // Prevent duplicate show times for the same screen
    const existingShow = await Show.findOne({
      theaterId: req.user._id,
      screen,
      date,
      "timeSlots.time": { $in: timeSlots },
      _id: { $ne: showId }, // Exclude the current show from the check
    });

    if (existingShow) {
      return res.status(400).json({
        success: false,
        message: "A show already exists for this screen at the selected time.",
      });
    }

    // Fetch the theater owner's seat configuration
    const theaterOwner = await TheaterOwner.findById(req.user._id);
    if (!theaterOwner || !theaterOwner.seatConfiguration) {
      return res.status(400).json({
        success: false,
        message: "Theater owner must have a seat configuration.",
      });
    }

    // Update show details
    show.screen = screen;
    show.date = date;
    show.timeSlots = timeSlots.map((slot) => ({
      time: slot,
      seats: theaterOwner.seatConfiguration.map((seat) => ({
        seatType: seat.seatType,
        totalSeats: seat.totalSeats,
        price: seat.price,
        bookedSeats: [], // Reset booked seats
      })),
    }));

    // Save updated show
    await show.save();

    res.status(200).json({
      success: true,
      message: "Show updated successfully!",
      show,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal Server Error",
      });
  }
};

/*==========
  DELETE SHOW
============ */
export const deleteShow = async (req, res) => {
  try {
  
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Show not found" });
    }

    // Only the creator can delete the show
    if (show.theaterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access Denied! You are not the creator of this show.",
      });
    }

    // Check if the show has any bookings
    const existingBookings = await Booking.findOne({ showId: req.params.id });
    if (existingBookings) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a show with existing bookings.",
      });
    }

    await Show.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Show deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal Server Error",
      });
  }
};