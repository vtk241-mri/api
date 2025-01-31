require("dotenv").config();
const jwt = require("jsonwebtoken");

const createResponse = (code, message, result = null, errors = null) => ({
  data: { code, message, result, errors },
});

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json(
      createResponse(401, "Access denied", null, {
        message: "No token provided",
      })
    );
  }

  try {
    const decoded = jwt.verify(token, "jwt_secret");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json(
      createResponse(403, "Invalid token", null, {
        message: "Token is not valid",
      })
    );
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res
      .status(403)
      .json(
        createResponse(403, "Access denied", null, { message: "Admins only" })
      );
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
