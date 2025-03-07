import jwt from "jsonwebtoken";

export const authorizedAdmin = (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    const token =
      req.cookies.token || req.headers["authorization"]?.split(" ")[1];
    // If no token is found, return an unauthorized response
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, No Token Provided" });
    }
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Check if the decoded token role is 'admin'
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden, Admin Access Only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token Expired, Please Login Again" });
    }
    res.status(401).json({ message: "Invalid Token" });
  }
};
