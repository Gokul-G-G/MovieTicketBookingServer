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

