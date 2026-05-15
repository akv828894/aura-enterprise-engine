export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (error, req, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value rejected.",
      errors: Object.keys(error.keyValue || {}).map((field) => ({
        field,
        message: `${field} must be unique.`,
      })),
    });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    message: error.message || "Server error.",
  });
};
