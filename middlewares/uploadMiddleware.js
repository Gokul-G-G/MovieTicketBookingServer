import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("Uploading File:", file); // ✅ Check if the file is reaching here
    return {
      folder: "movie_posters",
      format: file.mimetype.split("/")[1],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // Prevent overwriting
    };
  },
});


// Multer Middleware for File Upload
const upload = multer({ storage });

export default upload;
