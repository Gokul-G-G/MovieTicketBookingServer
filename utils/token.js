import jwt from "jsonwebtoken";

export const generateToken = (id, role) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in the environment variables");
  }

  try {
    const token = jwt.sign({ id, role }, process.env.SECRET_KEY, {
      expiresIn: "30m", // Token expiration time (you can change this if needed)
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Error generating token");
  }
};
