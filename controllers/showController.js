import { log } from "console";
import { Booking } from "../models/bookingsModel.js";
import { Movie } from "../models/movieModel.js";
import { Show } from "../models/showsModel.js";
import { TheaterOwner } from "../models/theaterModel.js";
import mongoose from "mongoose";

/*==========
  CREATE SHOW
============ */


const predefinedSeatRows = {
  Silver: ["A", "B", "C", "D", "E", "F"],
  Gold: ["A", "B", "C", "D", "E", "F", "G"],
  Platinum: ["A", "B", "C", "D", "E", "F", "G", "H"],
};

function generateSeatConfiguration(seatConfig) {
  let usedRows = new Set();
  let structuredSeats = [];

  seatConfig.forEach(({ seatType, price, rows, seats }) => {
    const availableRows = predefinedSeatRows[seatType] || [];

    // Get the next available rows and mark them as used
    const assignedRows = availableRows
      .filter((row) => !usedRows.has(row))
      .slice(0, rows);
    assignedRows.forEach((row) => usedRows.add(row)); // Mark as used

    structuredSeats.push({
      seatType,
      price: Number(price),
      rows: assignedRows.map((rowLabel) => ({
        rowLabel,
        seats: Array.from({ length: Number(seats) }, (_, seatIndex) => ({
          seatLabel: `${rowLabel}${seatIndex + 1}`,
          isBooked: false,
          price: Number(price),
        })),
      })),
    });
  });

  return structuredSeats;
}

export const addShow = async (req, res) => {
  try {
    const {
      movieId,
      screen,
      startDate,
      endDate,
      timeSlots,
      seatConfiguration,
    } = req.body;

    if (
      !movieId ||
      !screen ||
      !startDate ||
      !endDate ||
      !timeSlots ||
      timeSlots.length === 0 ||
      !seatConfiguration ||
      seatConfiguration.length === 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields.",
        });
    }
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid movieId format." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found." });
    }

    if (req.user.role !== "theaterOwner") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access Denied! Only theater owners can add shows.",
        });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res
        .status(400)
        .json({
          success: false,
          message: "End date must be after start date.",
        });
    }

    const showDates = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      showDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const createdShows = [];

    for (const date of showDates) {
      const existingShow = await Show.findOne({
        theaterId: req.user._id,
        screen,
        "dates.date": date,
        "dates.timeSlots.time": { $in: timeSlots },
      });

      if (existingShow) continue;

      // Use the new seat generation function
      const structuredSeatTypes = generateSeatConfiguration(seatConfiguration);

      // console.log("StructuredSeat", structuredSeatTypes);

      const formattedTimeSlots = timeSlots.map((slot) => ({
        time: slot,
        seatTypes: structuredSeatTypes,
      }));

      const newShow = new Show({
        movieId,
        theaterId: req.user._id,
        screen,
        dates: [{ date, timeSlots: formattedTimeSlots }],
        status: "Scheduled",
      });

      await newShow.save();
      createdShows.push(newShow);
    }

    res.status(201).json({
      success: true,
      message: `Shows added from ${startDate} to ${endDate}`,
      shows: createdShows,
    });
  } catch (error) {
    // console.error("Error in addShow:", error.response?.data || error.message);
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
    res.status(500).json({
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
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/*==========
  GET ALL SHOW
============ */
export const getAllShows = async (req, res) => {
  try {
    // console.log("Received movieId:", req.params.id);

    const shows = await Show.find({ movieId: req.params.id })
      .populate("movieId", "title poster date") // Populate movie details
      .populate({
        path: "theaterId",
        select: "theaterId name location", // Select required fields
      });

    // console.log("Shows Available for that movie:", shows);

    if (!shows || shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shows found.",
      });
    }

    // Formatting the response
  const formattedShows = shows.map((show) => ({
    _id: show._id,
    movie: show.movieId,
    theaterId: show.theaterId?._id || "Unknown",
    theater: {
      name: show.theaterId?.name || "Unknown",
      location: show.theaterId?.location || "Unknown",
    },
    screen: show.screen,
    dates: (show.dates || []).map((dateObj) => ({
      date: dateObj.date,
      timeSlots: (dateObj.timeSlots || []).map((slot) => ({
        time: slot.time,
        seatTypes: (slot.seatTypes || []).map((seatType) => ({
          seatType: seatType.seatType,
          rows: (seatType.rows || []).map((row) => ({
            rowLabel: row.rowLabel,
            seats: (row.seats || []).map((seat) => ({
              seatLabel: seat.seatLabel,
              isBooked: seat.isBooked,
              seatId: seat._id,
              price: seat.price, // ✅ Include the price here
            })),
          })),
          price: seatType.rows?.[0]?.seats?.[0]?.price || 0, // ✅ Extract price from first seat
        })),
      })),
    })),
    totalSeats: show.totalSeats || 0,
    status: show.status,
  }));


    res.status(200).json({
      success: true,
      message: "Shows fetched successfully!",
      shows: formattedShows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


/*==========
  SEAT AVAILABILITY
============ */

export const getSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { time } = req.query;

    if (!time) {
      return res.status(400).json({ message: "Time slot is required." });
    }

    // Fetch the show details including seat configuration
    const show = await Show.findById(showId).populate("theater");

    if (!show || !show.theater) {
      return res.status(404).json({ message: "Show or theater not found." });
    }

    // Get already booked seats for this time slot
    const bookedSeats = await Booking.find({
      showId,
      timeSlot: time,
    }).distinct("selectedSeats");

    // Send both seat configuration and booked seats
    res.status(200).json({
      seatConfiguration: show.theater.seatConfiguration,
      bookedSeats,
    });
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
