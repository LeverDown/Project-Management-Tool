export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
  const response = {
    message: err.message || 'Server Error'
  };
  if (err.errors) {
    response.errors = err.errors;
  }
  res.status(statusCode).json(response);
};
