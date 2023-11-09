const express = require("express");
require('dotenv').config();

const router = require("./routes");

const app = express();
const port = process.env.PORT || 3005;

// Middleware for JSON parsing
app.use(express.json());

app.use("/api", router);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection at:", promise, "reason:", reason);
});
