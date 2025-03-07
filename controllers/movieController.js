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

    // check the role. Only Theater Owners and Admins can add movies
    if (req.user.role !== "theaterOwner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          message:
            "Access Denied! Only Theater Owners and Admins can add movies.",
        });
    }

    //Create a new movie document
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
    });

    await newMovie.save();
    res
      .status(201)
      .json({ message: "Movie added successfully!", movie: newMovie });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/* ===============
   GET ALL MOVIES (Accessible to All Users)
================ */
export const getAllMovies = async (req, res) => {
  try {
    // Fetch all movies
    const movies = await Movie.find();
    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/* ===============
   GET MOVIE BY ID (Accessible to All Users)
================ */
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ movie });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
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

    // Only Theater Owners and Admins can update movies
    if (req.user.role !== "theaterOwner" && req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Access Denied! Only Theater Owners and Admins can update movies.",
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Update only the provided fields
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
    res.status(200).json({ message: "Movie updated successfully!", movie });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/* ===============
   DELETE MOVIE (Only Admins)
================ */
export const deleteMovie = async (req, res) => {
  try {
    // Check user role - Only admins can delete movies
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access Denied! Only Admins can delete movies." });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Movie deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
