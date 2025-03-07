import jwt from "jsonwebtoken";

export const authorizedAdmin = (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized, No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden, Admin Access Only" });
    }

    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};
