import { Movie } from "../models/movieModel.js";
import cloudinary from "../config/cloudinary.js";

/* ===============
   ADD A NEW MOVIE (Only Admins)
================ */
export const addMovie = async (req, res) => {
  try {
    // console.log("Received movie data===============:", req.body);
    // console.log("Received movie files==============:", req.files);
    const {
      title,
      genre,
      duration,
      releaseDate,
      rating,
      director,
      cast,
      description,
      language,
    } = req.body;



    //Convert duration (minutes) to HH:mm format
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    const formattedDuration = `${hours.toString().padStart(2, "0")}h ${mins
      .toString()
      .padStart(2, "0")}m`;

    // Cloudinary file URLs
    const bannerImage = req.files["bannerImage"][0]?.path || "";
    const posterImage = req.files["posterImage"][0]?.path || "";

    const newMovie = new Movie({
      title,
      genre,
      duration:formattedDuration,
      releaseDate,
      rating,
      director,
      cast,
      bannerImage,
      posterImage,
      description,
      language,
    });

    await newMovie.save();
    res.status(201).json({
      success: true,
      message: "Movie added successfully!",
      movie: newMovie,
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
   UPDATE MOVIE (Only Admins)
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

    // Only Admins can update movies
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only Admins can update movies.",
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
   DELETE MOVIE (Only Admins)
================ */
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    // Only Admins can delete movies
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only Admins can delete movies.",
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
