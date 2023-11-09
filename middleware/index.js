const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res.status(401).send({ message: "No token provided." });
    }
    if (headerToken && headerToken.split(" ")[0] !== "Bearer") {
      res.status(401).send({ message: "Invalid token." });
    }

    const token = headerToken.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    const message = error.message || "Could not authenticate";
    console.log(message);
    res.status(401).send({ message });
  }
};

module.exports = authenticateUser;
