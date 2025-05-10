require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Google Play Store Research API",
    endpoints: {
      search: "/api/search?query=<searchTerm>",
      appDetails: "/api/app/<appId>",
      analyze: "/api/analyze",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource was not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
