/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
module.exports = (err, req, res, next) => {
  // Log the error
  console.error("Error occurred:", err);

  // Check if it's a known error type
  if (err.type === "API_ERROR") {
    return res.status(err.statusCode || 500).json({
      error: err.name || "API Error",
      message: err.message || "An API error occurred",
    });
  }

  // Check if it's a validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const errorMessage =
    process.env.NODE_ENV === "development"
      ? err.message
      : "An unexpected error occurred";

  res.status(statusCode).json({
    error: err.name || "Server Error",
    message: errorMessage,
  });
};
