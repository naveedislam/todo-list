const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const utils = require("../utils");
const dbConfig = require("../config");
module.exports = {
  register: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Connect to the database
      const connection = await mysql.createConnection(dbConfig);

      // Check if the email already exists in the database
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM tbl_users WHERE email = ?",
        [email]
      );

      if (rows[0].count > 0) {
        res.status(400).json({ message: "Email already registered." });
      } else {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate a unique verification token
        const verificationToken = utils.generateVerificationToken(16);

        // Insert the new user into the database with a status of "unverified"
        await connection.execute(
          "INSERT INTO tbl_users (email, password, status, verification_token) VALUES (?, ?, ?, ?)",
          [email, hashedPassword, "unverified", verificationToken]
        );

        // Send a verification email
        // const verificationLink = `http://localhost:3005/api/auth/verify?token=${verificationToken}`;
        // await utils.sendVerificationEmail(email, verificationLink);

        res.status(201).json({
          message:
            "User registered. Check your email for verification instructions.",
        });
      }

      // Close the database connection
      connection.end();
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Connect to the database
      const connection = await mysql.createConnection(dbConfig);

      // Check if the user with the provided email exists
      const [rows] = await connection.execute(
        "SELECT id, password FROM tbl_users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        res.status(401).json({ message: "User not found." });
      } else {
        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, rows[0].password);

        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }
        // Generate a JWT token
        const userId = rows[0].id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        // Insert the token into the tbl_session table
        await connection.execute(
          "INSERT INTO tbl_session (user_id, token) VALUES (?, ?)",
          [userId, token]
        );

        res.status(200).json({ message: "Login successful", token });
      }

      // Close the database connection
      connection.end();
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  forgot: async (req, res) => {
    try {
      res.send({
        message: "forgot password",
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  verify: async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Connect to the database
      const token = req.query.token;
      // Update the task in the database
      await connection.execute(
        "UPDATE tbl_users SET status = ?, verification_token = ? WHERE verification_token = ?",
        ["verified", null, token]
      );

      res.send({
        message: "User verified successfully.",
      });
    } catch (error) {
      console.error("Error orccurred while verifying user:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      // Close the database connection
      connection.end();
    }
  },
};
