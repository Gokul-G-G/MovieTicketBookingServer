import { Movie } from "../models/movieModel.js";
import { TheaterOwner } from "../models/theaterModel.js";

/* ===============
   ADD A NEW MOVIE (Only Theater Owners & Admins)
================ */
export const addMovie = async (req, res) => {
  try {
    const {
      title,
      genre,
      duration,
      releaseDate,
      rating,
      director,
      cast,
      bannerImage,
      posterImage,
      description,
    } = req.body;

    // Only Theater Owners and Admins can add movies
    if (req.user.role !== "theaterOwner" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied! Only Theater Owners and Admins can add movies.",
      });
    }

    const newMovie = new Movie({
      title,
      genre,
      duration,
      releaseDate,
      rating,
      director,
      cast,
      bannerImage,
      posterImage,
      description,
      createdBy: req.user._id,
      creatorRole: req.user.role,
    });

    await newMovie.save();
    res.status(201).json({
      success: true,
      message: "Movie added successfully!",
      movie: newMovie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* ===============
   GET ALL MOVIES (Accessible to All Users)
================ */
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* ===============
   GET MOVIES ADDED BY A THEATER OWNER
================ */
export const getMoviesByTheaterOwner = async (req, res) => {
  try {
    // Only Theater Owners can fetch their added movies
    if (req.user.role !== "TheaterOwner") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only Theater Owners can view their movies.",
      });
    }

    const movies = await Movie.find({ createdBy: req.user._id });
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* ===============
   GET MOVIE BY ID (Accessible to All Users)
================ */
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }
    res.status(200).json({ success: true, movie });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* ===============
   UPDATE MOVIE (Only Theater Owners & Admins)
================ */
export const updateMovie = async (req, res) => {
  try {
    const {
      title,
      genre,
      duration,
      releaseDate,
      rating,
      director,
      cast,
      bannerImage,
      posterImage,
      description,
    } = req.body;

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    // Admin can edit any movie, but Theater Owner can only edit their own movies
    if (
      req.user.role === "theaterOwner" &&
      movie.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied! You can only edit movies that you have created.",
      });
    }

    // Theater Owner should not be able to edit movies created by Admins
    if (req.user.role === "theaterOwner" && movie.creatorRole === "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! You cannot edit movies created by an Admin.",
      });
    }

    // Update only provided fields
    movie.title = title || movie.title;
    movie.genre = genre || movie.genre;
    movie.duration = duration || movie.duration;
    movie.releaseDate = releaseDate || movie.releaseDate;
    movie.rating = rating || movie.rating;
    movie.director = director || movie.director;
    movie.cast = cast || movie.cast;
    movie.bannerImage = bannerImage || movie.bannerImage;
    movie.posterImage = posterImage || movie.posterImage;
    movie.description = description || movie.description;

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie updated successfully!",
      movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* ===============
   DELETE MOVIE (Only Admins or Movie Creator)
================ */
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    // Only the creator or Admin can delete the movie
    if (
      movie.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access Denied! You are not the creator of this movie.",
      });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Movie deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
