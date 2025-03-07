import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: [String], //Have multiple Genre
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number, // IMDb or custom rating (e.g., 1-10 scale)
      required: true,
      min: 0,
      max: 10,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    cast: {
      type: [String], // Array to store multiple actors
      required: true,
    },
    bannerImage: {
      type: String, // URL of the banner image
      required: true,
    },
    posterImage: {
      type: String, // URL of the poster image
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.model("Movie", movieSchema);
