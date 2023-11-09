const express = require("express");
const router = express.Router();

// Middleware
const verifyToken = require("../middleware");

// Routes
const todoRoutes = require("./todo.routes");
const authRoutes = require("./auth.routes");

router.use("/auth", authRoutes);
router.use("/todos", verifyToken, todoRoutes);

module.exports = router;
