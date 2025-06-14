const jwt = require("jsonwebtoken");
const { User } = require("../model/User.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first, then cookies
    let token = null;

    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }

    // If no token in header, try cookies
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded token's email
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token. User not found." });
    }

    // Add user to request object for use in routes
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in authMiddleware:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
